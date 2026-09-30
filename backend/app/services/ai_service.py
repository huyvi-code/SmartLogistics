import os
import re
import httpx
from typing import Optional, List
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import DonHang, User, SuCo, LogTrangThai, TaiXe
from app.schemas.schemas import (
    IncidentSolutionResponse, AIChatResponse, DonHangOut,
    DriverRecommendation, DriverRecommendationResponse
)
from app.services.fee_service import calculate_shipping_fee
from app.schemas.schemas import FeeCalculationRequest

def generate_incident_solution(order_id: int, loai_su_co: str, mo_ta: str, db: Session) -> IncidentSolutionResponse:
    """
    Module 1: AI Phân tích & Gợi ý giải quyết sự cố giao hàng (Incident Diagnosis & Resolution Copilot)
    """
    order = db.query(DonHang).filter(DonHang.id == order_id).first()
    ma_van_don = order.ma_van_don if order else f"#{order_id}"

    # 1. Thử gọi LLM / Gemini nếu có cấu hình GEMINI_API_KEY
    if settings.GEMINI_API_KEY:
        try:
            prompt = f"""
Bạn là chuyên gia điều phối vận tải logistics thông minh của SmartLogistics TMS.
Hãy phân tích sự cố giao hàng sau và đưa ra giải pháp khắc phục cụ thể:
- Mã vận đơn: {ma_van_don}
- Loại sự cố: {loai_su_co}
- Chi tiết sự cố từ hiện trường: {mo_ta}

Yêu cầu câu trả lời:
- Đánh giá mức độ nghiêm trọng: THAP, TRUNG_BINH, CAO, hoặc KHAN_CAP.
- Dự đoán nguyên nhân cốt lõi.
- Đề xuất biện pháp xử lý khắc phục tối ưu nhất.
- 3 bước hành động cụ thể tiếp theo cho điều phối viên.
Trả lời bằng tiếng Việt ngắn gọn, súc tích, chuyên nghiệp.
"""
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            with httpx.Client(timeout=8.0) as client:
                resp = client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    ai_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    if ai_text:
                        severity = "KHAN_CAP" if any(k in mo_ta.lower() for k in ["hư", "móp", "từ chối", "mất"]) else "TRUNG_BINH"
                        return IncidentSolutionResponse(
                            muc_do_nghiem_trong=severity,
                            nguyen_nhan_du_doan=f"Phân tích AI: {loai_su_co} do yếu tố hiện trường giao nhận.",
                            bien_phap_khac_phuc_goi_y=ai_text.strip(),
                            hanh_dong_tiep_theo=[
                                "Liên hệ khách hàng xác nhận lại thông tin và thỏa thuận khung giờ mới",
                                "Cập nhật thời gian phát hàng dự kiến mới trên phần mềm TMS",
                                "Lưu tạm kiện hàng an toàn tại bưu cục đích"
                            ]
                        )
        except Exception as e:
            print("Gemini API call failed, falling back to smart expert rules:", str(e))

    # 2. Local Smart Heuristics Engine (Fallback thông minh, nhanh và chuẩn nghiệp vụ)
    loai_lower = loai_su_co.lower()
    desc_lower = mo_ta.lower()

    if "hẹn lại" in loai_lower:
        severity = "THAP"
        cause = "Khách hàng bận việc đột xuất hoặc chưa có mặt tại địa chỉ nhận."
        resolution = "Lưu kho tạm thời bưu kiện tại bưu cục đích. Điều phối viên lập lịch phát lại vào khung giờ khách đã hẹn trong ca làm việc tiếp theo."
        actions = [
            "Gửi tin nhắn SMS/Zalo tự động xác nhận lịch hẹn mới với khách",
            "Cập nhật trạng thái đơn sang 'Chờ phát lại'",
            "Ưu tiên phân công giao sớm trong ca sáng ngày hôm sau"
        ]
    elif "không liên lạc" in loai_lower or "không nghe" in desc_lower:
        severity = "TRUNG_BINH"
        cause = "Thuê bao người nhận bận, ngoài vùng phủ sóng hoặc không nhấc máy số lạ."
        resolution = "Tài xế thực hiện tối thiểu 3 cuộc gọi cách nhau 15-20 phút. Nếu vẫn không liên lạc được, liên hệ ngay người gửi để xin số điện thoại phụ."
        actions = [
            "Tài xế để lại tin nhắn thông báo đã đến điểm giao",
            "Liên hệ hotline/người gửi để đối chiếu thông tin người nhận",
            "Giữ đơn tại bưu cục 24h trước khi kích hoạt quy trình chuyển hoàn"
        ]
    elif "sai" in loai_lower or "địa chỉ" in desc_lower:
        severity = "CAO"
        cause = "Thông tin địa chỉ bị nhầm số nhà, sai ngõ/ngách hoặc khách đã chuyển địa điểm."
        resolution = "Xác nhận lại tọa độ chính xác với người gửi/người nhận. Nếu cùng quận, tài xế tiếp tục giao; nếu khác quận, chuyển điều phối sang tuyến giao phù hợp."
        actions = [
            "Cập nhật địa chỉ chính xác vào hệ thống vận đơn",
            "Tính phụ phí chuyển hướng tuyến nếu cự ly lệch > 5km",
            "Bàn giao đơn cho tài xế phụ trách tuyến mới"
        ]
    elif "móp" in loai_lower or "hư" in desc_lower or "từ chối" in desc_lower:
        severity = "KHAN_CAP"
        cause = "Nghi vấn va đập trong quá trình vận chuyển hoặc bưu phẩm không đúng thỏa thuận ban đầu của shop."
        resolution = "Tài xế chụp ảnh hiện trạng 4 mặt kiện hàng có chứng kiến của khách. Lập biên bản đồng kiểm và giữ nguyên tem niêm phong để làm thủ tục bảo hiểm bồi hoàn."
        actions = [
            "Chụp ảnh biên bản và hiện trạng tải lên hệ thống",
            "Báo bộ phận bồi thường bảo hiểm đơn hàng",
            "Lập phiếu hoàn hàng về cho người gửi gốc"
        ]
    else:
        severity = "CAO"
        cause = "Sự cố giao thông hoặc kỹ thuật phương tiện trên đường di chuyển."
        resolution = "Điều động tài xế dự phòng ở bưu cục gần nhất đến hiện trường để san tải các đơn hàng hỏa tốc/ưu tiên cao."
        actions = [
            "Xác định tọa độ hiện tại của tài xế gặp sự cố",
            "Chuyển giao các đơn ưu tiên cho tài xế cứu trợ",
            "Cập nhật cảnh báo chậm giao cho khách hàng"
        ]

    return IncidentSolutionResponse(
        muc_do_nghiem_trong=severity,
        nguyen_nhan_du_doan=cause,
        bien_phap_khac_phuc_goi_y=resolution,
        hanh_dong_tiep_theo=actions
    )


def chat_with_logistics_ai(message: str, current_user: Optional[User], db: Session) -> AIChatResponse:
    """
    Module 2: Chatbot AI Tra cứu Vận đơn & Tư vấn Logistics thông minh
    - Tự động nhận diện mã vận đơn (VN2026-xxxx hoặc số hiệu 4 chữ số) để tra cứu dữ liệu thời gian thực
    - Trả về câu trả lời tự nhiên kèm đối tượng related_order để hiển thị thẻ vận đơn
    - Hỗ trợ tra cước, chính sách giao hàng, tình trạng đơn hàng
    """
    clean_msg = message.strip()
    related_order_data = None
    suggested_actions = []

    # 1. Nhận diện mã vận đơn trong tin nhắn (VD: VN2026-8801, VN2026-8804 hoặc 8801, 8802...)
    order_match = re.search(r'(VN\d{4}-\d{4}|\b\d{4}\b)', clean_msg, re.IGNORECASE)
    order_context_str = ""

    if order_match:
        matched_str = order_match.group(1).upper()
        if len(matched_str) == 4 and matched_str.isdigit():
            query_code = f"VN2026-{matched_str}"
        else:
            query_code = matched_str

        order = db.query(DonHang).filter(DonHang.ma_van_don.ilike(f"%{query_code}%")).first()
        if order:
            related_order_data = DonHangOut.model_validate(order)
            driver_info = f"Tài xế {order.tai_xe.ho_ten} ({order.tai_xe.so_dien_thoai})" if order.tai_xe else "Chưa gán tài xế"
            
            # Lấy mốc log mới nhất
            latest_log = order.logs[0].mo_ta_chi_tiet if order.logs else "Chưa có sự kiện"

            order_context_str = (
                f"\n[DỮ LIỆU ĐƠN HÀNG THỰC TẾ]:\n"
                f"- Mã vận đơn: {order.ma_van_don}\n"
                f"- Trạng thái: {order.trang_thai}\n"
                f"- Sự kiện gần nhất: {latest_log}\n"
                f"- Người gửi: {order.nguoi_gui_ten} ({order.nguoi_gui_dia_chi}, {order.nguoi_gui_tinh_thanh})\n"
                f"- Người nhận: {order.nguoi_nhan_ten} - {order.nguoi_nhan_sdt} ({order.nguoi_nhan_dia_chi}, {order.nguoi_nhan_tinh_thanh})\n"
                f"- Hàng hóa: {order.loai_hang_hoa} ({order.khoi_luong_kg} kg)\n"
                f"- Tiền thu hộ COD: {order.tien_thu_ho_cod:,.0f} đ\n"
                f"- Cước phí: {order.cuoc_phi_van_chuyen:,.0f} đ\n"
                f"- Phụ trách: {driver_info}\n"
            )
            suggested_actions = [
                f"Xem chi tiết vận đơn {order.ma_van_don}",
                "Báo sự cố đơn hàng này",
                "Tính cước đơn mới"
            ]

    # 2. Nếu có cấu hình GEMINI_API_KEY, truy vấn Generative AI (RAG pattern với tri thức CSKH chuyên sâu)
    if settings.GEMINI_API_KEY:
        try:
            system_prompt = f"""
Bạn là Chuyên viên CSKH & Trợ lý AI Thông minh của Hệ thống Vận tải Giao hàng SmartLogistics TMS (Việt Nam).
Người đang trò chuyện: {current_user.ho_ten if current_user else 'Khách hàng / Đối tác'}.

TÀI LIỆU QUY CHUẨN CSKH CỦA HỆ THỐNG:
1. Bảng cước vận chuyển:
   - Nội tỉnh: 22.000 đ (1kg đầu), vượt 1kg: +5.000 đ/kg.
   - Liên tỉnh: 38.000 đ (1kg đầu), vượt 1kg: +5.000 đ/kg.
   - Phí COD: 1% giá trị thu hộ (miễn phí nội tỉnh < 1 triệu đ).
2. Thời gian giao hàng:
   - Hỏa tốc (Flash 2H): giao trong 2 giờ nội thành.
   - Ưu tiên (Same-day): giao trong ngày (4-8 giờ).
   - Tiêu chuẩn (Standard): 24-48 giờ toàn quốc.
3. Hàng cấm & có điều kiện:
   - Cấm tuyệt đối: Vũ khí, chất nổ, ma túy, tiền mặt, vàng bạc, động vật sống quý hiếm.
   - Có điều kiện: Nước hoa/chất lỏng phải bọc màng co nắp và chèn xốp bóng khí; đồ điện tử pin < 100Wh; thực phẩm khô có nhãn mác.
4. Quy chuẩn đóng gói:
   - Hàng dễ vỡ (gốm sứ, thủy tinh, mỹ phẩm): quấn 3-4 lớp bọt khí (bubble wrap), chèn 6 mặt hộp, dán nhãn "HÀNG DỄ VỠ".
   - Quần áo: túi ni-lông niêm phong chống thấm nước.
5. Chính sách bồi thường:
   - Đơn có bảo hiểm/khai giá (phí 1%): Bồi thường 100% giá trị khai báo khi mất mát, hư hỏng.
   - Đơn không khai giá: Bồi thường tối đa 4 lần cước vận chuyển.
   - Thời hạn tiếp nhận khiếu nại: Trong 48 giờ kể từ khi phát hàng. Thời gian giải quyết: 3-5 ngày làm việc.
6. Chính sách đối soát COD:
   - Tự động chuyển khoản ngân hàng định kỳ vào Thứ 2, Thứ 4, Thứ 6 hàng tuần.
7. Chuyển hoàn & Lưu kho:
   - Miễn phí giao lại 3 lần. Lưu kho tối đa 3 ngày trước khi chuyển hoàn (phí hoàn 50% cước đi).
8. Xem hàng & Đồng kiểm:
   - Mặc định cho xem hàng không thử; không cho xem nếu người gửi có ghi chú "Không xem hàng".
9. Hotline & Giờ làm việc:
   - Bưu cục mở cửa: 07:30 - 18:30 (Thứ 2 - Thứ 7), Chủ Nhật nhận đơn hỏa tốc đến 12:00.
   - Hotline hỗ trợ CSKH 24/7: 1900 - 8800. Email: cskh@smartlog.vn.

DỮ LIỆU ĐƠN HÀNG TRA CỨU ĐƯỢC TỪ HỆ THỐNG:
{order_context_str if order_context_str else 'Không có mã vận đơn cụ thể trong tin nhắn.'}

Yêu cầu trả lời:
- Luôn thân thiện, niềm nở, lịch sự, thấu cảm, xưng hô "SmartLogistics" và "quý khách/bạn".
- Định dạng Markdown đẹp mắt, có bullet points, emoji sinh động, ngắn gọn súc tích.
Tin nhắn của khách hàng: "{clean_msg}"
"""
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {"contents": [{"parts": [{"text": system_prompt}]}]}
            with httpx.Client(timeout=8.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    g_data = res.json()
                    ai_reply = g_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    if ai_reply:
                        return AIChatResponse(
                            reply=ai_reply.strip(),
                            suggested_actions=suggested_actions,
                            related_order=related_order_data,
                            source="gemini_pro"
                        )
        except Exception as e:
            print("Gemini Chat failed, falling back to local CSKH engine:", str(e))

    # 3. Local Smart CSKH Logistics Engine (Bộ tri thức chăm sóc khách hàng toàn diện)
    lower_msg = clean_msg.lower()

    # Nhánh A: Khách hỏi tra cứu và tìm thấy vận đơn
    if related_order_data:
        st_badge = {
            "MOI": "🔵 Mới tiếp nhận (đang chờ phân công tài xế)",
            "DA_LAY_HANG": "🟣 Đã lấy hàng về bưu cục trung chuyển",
            "DANG_GIAO": "🚚 Đang trên đường giao tới bạn",
            "GIAO_THANH_CONG": "✅ Đã giao hàng thành công",
            "THAT_BAI": "⚠️ Đang gặp sự cố / hoãn phát"
        }.get(related_order_data.trang_thai, related_order_data.trang_thai)

        driver_str = f"{related_order_data.tai_xe.ho_ten} ({related_order_data.tai_xe.so_dien_thoai})" if related_order_data.tai_xe else "Đang điều phối"

        reply = (
            f"📦 **Kết quả tra cứu vận đơn `{related_order_data.ma_van_don}`:**\n\n"
            f"- **Trạng thái:** {st_badge}\n"
            f"- **Người nhận:** {related_order_data.nguoi_nhan_ten} - SĐT: {related_order_data.nguoi_nhan_sdt}\n"
            f"- **Địa chỉ giao:** {related_order_data.nguoi_nhan_dia_chi}, {related_order_data.nguoi_nhan_tinh_thanh}\n"
            f"- **Hàng hóa:** {related_order_data.loai_hang_hoa} ({related_order_data.khoi_luong_kg} kg)\n"
            f"- **Tiền thu hộ COD:** **{related_order_data.tien_thu_ho_cod:,.0f} đ**\n"
            f"- **Cước vận chuyển:** **{related_order_data.cuoc_phi_van_chuyen:,.0f} đ**\n"
            f"- **Tài xế giao hàng:** {driver_str}\n\n"
            f"💡 *Bạn có thể theo dõi thẻ tiến độ chi tiết ngay phía dưới tin nhắn này!*"
        )
        return AIChatResponse(
            reply=reply,
            suggested_actions=suggested_actions,
            related_order=related_order_data,
            source="smart_nlp"
        )

    # Nhánh B: Khách gõ từ khóa tra cứu nhưng chưa nhập mã
    if any(k in lower_msg for k in ["tra cứu", "đơn hàng", "vận đơn", "kiểm tra đơn", "hàng của tôi"]):
        reply = (
            f"🔍 **Hỗ trợ tra cứu vận đơn tự động:**\n\n"
            f"Bạn vui lòng cung cấp mã vận đơn (Ví dụ: **`VN2026-8801`**, **`VN2026-8803`** hoặc chỉ cần gõ 4 số cuối như **`8801`**, **`8804`**).\n\n"
            f"Hệ thống sẽ tra cứu tức thì vị trí, trạng thái kiện hàng và thông tin tài xế cho bạn!"
        )
        return AIChatResponse(
            reply=reply,
            suggested_actions=["Tra cứu đơn VN2026-8801", "Tra cứu đơn VN2026-8803", "Bảng giá cước"],
            source="smart_nlp"
        )

    # Nhánh C: CSKH - Đóng gói hàng hóa (Packaging)
    if any(k in lower_msg for k in ["đóng gói", "bọc hàng", "dễ vỡ", "thùng carton", "xốp", "gốm", "thủy tinh", "mỹ phẩm"]):
        reply = (
            f"📦 **Quy chuẩn đóng gói hàng hóa an toàn của SmartLogistics:**\n\n"
            f"1. **Hàng dễ vỡ (gốm sứ, thủy tinh, chai lọ mỹ phẩm):**\n"
            f"   - Quấn tối thiểu **3 - 4 lớp bọt khí (bubble wrap)** quanh sản phẩm.\n"
            f"   - Chèn xốp mút chật kín 6 mặt hộp carton, không để khoảng hở rung lắc.\n"
            f"   - Dán nhãn cảnh báo **'HÀNG DỄ VỠ'** màu đỏ bên ngoài kiện.\n"
            f"2. **Hàng chất lỏng, dầu gội, dung dịch:**\n"
            f"   - Bọc màng co hoặc băng keo kín nắp chai, đặt trong túi zip chống tràn.\n"
            f"3. **Quần áo, hàng mềm:**\n"
            f"   - Cho vào túi ni-lông niêm phong chống rách và chống thấm nước.\n"
            f"4. **Đồ điện tử, linh kiện:**\n"
            f"   - Sử dụng hộp nguyên seal của nhà sản xuất hoặc chèn mút chống sốc tĩnh điện."
        )
        return AIChatResponse(
            reply=reply,
            suggested_actions=["Quy định hàng cấm gửi", "Chính sách bồi thường", "Bảng cước phí"],
            source="smart_nlp"
        )

    # Nhánh D: CSKH - Hàng cấm & hàng gửi có điều kiện (Prohibited / Restricted items)
    if any(k in lower_msg for k in ["cấm", "hạn chế", "chất lỏng", "nước hoa", "pin", "rượu", "tươi sống", "hóa chất", "thuốc lá"]):
        reply = (
            f"🚫 **Quy định hàng hóa cấm & gửi có điều kiện:**\n\n"
            f"❌ **Hàng CẤM vận chuyển tuyệt đối:**\n"
            f"- Vũ khí quân dụng, đạn dược, vật liệu nổ, pháo các loại.\n"
            f"- Ma túy, tiền chất gây nghiện, chất kích thích, văn hóa phẩm đồi trụy.\n"
            f"- Tiền mặt, vàng bạc đá quý, kim loại quý hiếm.\n"
            f"- Động vật sống hoang dã nguy cấp.\n\n"
            f"⚠️ **Hàng gửi CÓ ĐIỀU KIỆN (phải đóng gói đúng chuẩn):**\n"
            f"- **Chất lỏng / nước hoa:** Chèn túi bóng khí chống rò rỉ, tối đa 500ml/chai.\n"
            f"- **Thiết bị có pin lithium:** Dung lượng pin dưới 100Wh, đóng gói cách điện.\n"
            f"- **Thực phẩm khô:** Có nhãn mác hạn sử dụng đầy đủ (không nhận hàng tươi sống mau hỏng quá 24h nếu không đi gói Hỏa Tốc)."
        )
        return AIChatResponse(
            reply=reply,
            suggested_actions=["Quy cách đóng gói", "Chính sách bồi thường", "Tư vấn gửi hỏa tốc"],
            source="smart_nlp"
        )

    # Nhánh E: CSKH - Chính sách bồi thường & giải quyết khiếu nại (Compensation & Claims)
    if any(k in lower_msg for k in ["bồi thường", "đền bù", "mất hàng", "thất lạc", "hư hỏng", "khiếu nại", "bảo hiểm", "đền"]):
        reply = (
            f"🛡️ **Chính sách bồi thường & giải quyết khiếu nại:**\n\n"
            f"1. **Đơn hàng có khai giá / bảo hiểm hàng hóa (phí 1%):**\n"
            f"   - Bồi thường **100% giá trị khai báo** nếu bưu gửi bị mất mát hoặc hư hỏng toàn phần do lỗi vận chuyển.\n"
            f"2. **Đơn hàng tiêu chuẩn (không khai giá):**\n"
            f"   - Bồi thường tối đa **4 lần cước phí vận chuyển** của đơn hàng.\n"
            f"3. **Thời hạn tiếp nhận khiếu nại:**\n"
            f"   - Trong vòng **48 giờ** kể từ thời điểm giao hàng hoặc phát sinh sự cố.\n"
            f"4. **Thời gian giải quyết & chi trả:**\n"
            f"   - Từ **3 - 5 ngày làm việc** sau khi lập biên bản đồng kiểm xác nhận lỗi."
        )
        return AIChatResponse(
            reply=reply,
            suggested_actions=["Quy định xem hàng", "Hotline khiếu nại 1900-8800", "Bảng giá cước"],
            source="smart_nlp"
        )

    # Nhánh F: CSKH - Đối soát COD & nhận tiền thu hộ (COD Settlement)
    if any(k in lower_msg for k in ["đối soát", "tiền cod", "khi nào nhận tiền", "trả tiền cod", "chuyển khoản cod", "lịch cod"]):
        reply = (
            f"💳 **Chính sách đối soát và chi trả tiền thu hộ (COD):**\n\n"
            f"- 🗓️ **Lịch đối soát tự động:** Định kỳ vào các ngày **Thứ 2, Thứ 4, Thứ 6** hàng tuần (hoặc đối soát hàng ngày cho đối tác VIP).\n"
            f"- 🏦 **Hình thức thanh toán:** Chuyển khoản trực tiếp vào tài khoản ngân hàng của người gửi.\n"
            f"- 💰 **Phí dịch vụ COD:** Chỉ **1%** trên giá trị tiền thu hộ (miễn phí COD cho các đơn nội tỉnh dưới 1.000.000 đ).\n"
            f"- 📲 Khách hàng có thể theo dõi chi tiết số tiền COD từng đơn ngay trên Cổng Khách Hàng."
        )
        return AIChatResponse(
            reply=reply,
            suggested_actions=["Tra cứu đơn VN2026-8801", "Bảng giá cước", "Đăng ký gửi đơn"],
            source="smart_nlp"
        )

    # Nhánh G: CSKH - Chuyển hoàn & Lưu kho (Return & Storage)
    if any(k in lower_msg for k in ["chuyển hoàn", "hoàn hàng", "trả hàng", "lưu kho", "giao lại", "mấy lần", "không nhận"]):
        reply = (
            f"🔄 **Chính sách phát lại, lưu kho & chuyển hoàn:**\n\n"
            f"- 🚚 **Số lần giao lại:** Miễn phí giao lại tối đa **3 lần** (tài xế sẽ gọi điện và hẹn lại trước khi đến).\n"
            f"- 🏢 **Thời hạn lưu kho:** Kiện hàng chưa phát được sẽ lưu kho bưu cục tối đa **3 ngày**. Quá thời hạn này, hệ thống sẽ tự động kích hoạt lệnh chuyển hoàn về cho shop.\n"
            f"- 💸 **Phí chuyển hoàn:** Miễn phí chuyển hoàn cho khách hàng doanh nghiệp ký hợp đồng; tính **50% cước chiều đi** cho đơn lẻ thông thường."
        )
        return AIChatResponse(
            reply=reply,
            suggested_actions=["Chính sách bồi thường", "Hotline hỗ trợ", "Tra cứu đơn hàng"],
            source="smart_nlp"
        )

    # Nhánh H: CSKH - Cho xem hàng & Đồng kiểm (Inspection on Delivery)
    if any(k in lower_msg for k in ["đồng kiểm", "xem hàng", "cho xem", "thử hàng", "mở hàng"]):
        reply = (
            f"🔍 **Quy định xem hàng và đồng kiểm khi nhận:**\n\n"
            f"- 👀 **Mặc định:** Người nhận được **xem hàng ngoại quan** (kiểm tra mẫu mã, số lượng đúng hóa đơn) trước khi thanh toán, **không được thử** (không mặc thử, không cắm điện thử máy, không bóc tem niêm phong sản phẩm).\n"
            f"- 🚫 **Nếu người gửi yêu cầu 'Không cho xem hàng':** Tài xế sẽ chỉ phát hàng sau khi người nhận hoàn tất ký nhận và thanh toán cước/COD.\n"
            f"- 📹 Khuyến khích người nhận quay video clip quá trình mở hộp để được hỗ trợ bồi thường nhanh nhất nếu có sự cố bể vỡ."
        )
        return AIChatResponse(
            reply=reply,
            suggested_actions=["Chính sách bồi thường", "Quy cách đóng gói", "Bảng giá cước"],
            source="smart_nlp"
        )

    # Nhánh I: CSKH - Giờ làm việc bưu cục & Hotline tổng đài (Working hours & Hotline)
    if any(k in lower_msg for k in ["giờ làm việc", "mở cửa", "đóng cửa", "chủ nhật", "hotline", "tổng đài", "liên hệ", "số điện thoại", "sđt cskh"]):
        reply = (
            f"⏰ **Thời gian hoạt động & Kênh hỗ trợ CSKH SmartLogistics:**\n\n"
            f"- 🏢 **Giờ mở cửa bưu cục:** **07:30 - 18:30** (Từ Thứ Hai đến Thứ Bảy).\n"
            f"- ☀️ **Chủ Nhật:** Bưu cục mở cửa từ **08:00 - 12:00** (chỉ tiếp nhận đơn Hỏa Tốc).\n"
            f"- 🛵 **Tài xế giao hàng:** Hoạt động liên tục từ **08:00 - 20:00** hàng ngày.\n"
            f"- 📞 **Hotline CSKH 24/7:** **`1900 - 8800`** (Hỗ trợ khiếu nại, sự cố, cước phí).\n"
            f"- 📧 **Email tiếp nhận thông tin:** `cskh@smartlog.vn`.\n"
            f"- 🌐 **Hệ thống website:** Tra cứu vận đơn trực tuyến 24/7."
        )
        return AIChatResponse(
            reply=reply,
            suggested_actions=["Tra cứu đơn VN2026-8801", "Bảng giá cước", "Chính sách bồi thường"],
            source="smart_nlp"
        )

    # Nhánh J: CSKH - Hướng dẫn gửi hàng lần đầu / Tạo đơn
    if any(k in lower_msg for k in ["hướng dẫn gửi", "cách gửi", "tạo đơn", "lần đầu", "gửi hàng như thế nào", "gửi bưu phẩm"]):
        reply = (
            f"📝 **Hướng dẫn 3 bước gửi hàng nhanh cùng SmartLogistics:**\n\n"
            f"1. **Tạo đơn trên hệ thống:**\n"
            f"   - Đăng nhập tài khoản Khách Hàng (hoặc chọn tài khoản demo `customer@smartlog.vn`).\n"
            f"   - Bấm nút **'Đăng Ký Gửi Đơn Hàng Mới'**.\n"
            f"2. **Điền thông tin & Xem cước tự động:**\n"
            f"   - Nhập địa chỉ người gửi, người nhận, cân nặng và tiền thu hộ COD. Hệ thống sẽ tự động tính cước minh bạch ngay lập tức.\n"
            f"3. **Tài xế đến lấy tận nơi:**\n"
            f"   - Sau khi tạo đơn, hệ thống sẽ cấp mã vận đơn `VN2026-xxxx` và tự động điều phối shipper đến lấy hàng tận nhà!"
        )
        return AIChatResponse(
            reply=reply,
            suggested_actions=["Bảng giá cước", "Thời gian giao hỏa tốc", "Đóng gói hàng dễ vỡ"],
            source="smart_nlp"
        )

    # Nhánh K: Hỏi về cước phí / tính giá
    if any(k in lower_msg for k in ["cước", "giá", "bao nhiêu tiền", "phí ship", "tính giá", "bảng giá", "báo giá"]):
        reply = (
            f"💰 **Chính sách cước vận chuyển tiêu chuẩn SmartLogistics:**\n\n"
            f"1. **Cước cơ bản:**\n"
            f"   - Giao nội tỉnh: **22.000 đ** (cho 1kg đầu tiên)\n"
            f"   - Giao liên tỉnh: **38.000 đ** (cho 1kg đầu tiên)\n"
            f"2. **Phụ phí khối lượng:** **5.000 đ** cho mỗi 1kg vượt thêm (> 1kg)\n"
            f"3. **Phí dịch vụ thu hộ COD:** **1%** giá trị tiền thu hộ (miễn phí nội tỉnh < 1 triệu đ)\n\n"
            f"👉 *Ví dụ: Kiện hàng 3kg gửi nội tỉnh có cước là: 22.000đ + (2 × 5.000đ) = 32.000 đ.*"
        )
        return AIChatResponse(
            reply=reply,
            suggested_actions=["Đóng gói hàng dễ vỡ", "Thời gian giao hỏa tốc", "Lịch đối soát COD"],
            source="smart_nlp"
        )

    # Nhánh L: Hỏi về thời gian giao hàng / mức độ ưu tiên
    if any(k in lower_msg for k in ["mấy ngày", "thời gian", "khi nào tới", "hỏa tốc", "tiêu chuẩn"]):
        reply = (
            f"⚡ **Thời gian cam kết phát hàng theo gói dịch vụ:**\n\n"
            f"- 🚀 **Hỏa tốc (Flash 2H):** Giao ngay trong vòng **2 giờ** nội thành, tài xế chuyên trách ưu tiên.\n"
            f"- ⚡ **Ưu tiên (Same-day):** Giao trong ngày (**4 - 8 giờ**) kể từ lúc nhận hàng.\n"
            f"- 📦 **Tiêu chuẩn (Standard):** Giao trong **24 - 48 giờ** với chi phí tối ưu nhất."
        )
        return AIChatResponse(
            reply=reply,
            suggested_actions=["Tra cứu đơn VN2026-8801", "Bảng giá cước", "Quy định xem hàng"],
            source="smart_nlp"
        )

    # Mặc định: Lời chào trợ lý CSKH toàn diện
    user_name = current_user.ho_ten if current_user else "quý khách"
    reply = (
        f"Xin chào **{user_name}**! Tôi là **Trợ lý AI & CSKH SmartLogistics TMS** 🤖.\n\n"
        f"Tôi có thể giải đáp và hỗ trợ bạn mọi vấn đề vận chuyển:\n"
        f"1. 🔍 **Tra cứu vận đơn:** Gửi mã đơn (VD: `VN2026-8801` hoặc `8803`)\n"
        f"2. 📦 **Hướng dẫn đóng gói:** Quy chuẩn bọc đồ dễ vỡ, chất lỏng, điện tử\n"
        f"3. 🛡️ **Chính sách bồi thường & khiếu nại:** Quy định đền bù khi mất mát, hư hỏng\n"
        f"4. 💳 **Lịch đối soát COD:** Thời gian nhận tiền thu hộ qua tài khoản\n"
        f"5. 🚫 **Quy định hàng cấm gửi & hàng có điều kiện**\n"
        f"6. ⏰ **Giờ làm việc bưu cục & Hotline tổng đài 1900-8800**\n\n"
        f"Bạn cần hỗ trợ thông tin gì hôm nay?"
    )
    return AIChatResponse(
        reply=reply,
        suggested_actions=[
            "Tra cứu đơn VN2026-8801",
            "Đóng gói hàng dễ vỡ",
            "Chính sách bồi thường",
            "Lịch đối soát COD",
            "Giờ làm việc & Hotline"
        ],
        source="smart_nlp"
    )


def generate_driver_recommendations(order_id: int, db: Session) -> DriverRecommendationResponse:
    """
    Module 3: AI Gợi ý & Đề xuất phân công tài xế thông minh (AI Driver Assignment Recommendation)
    Dựa trên: Tải trọng xe còn trống, cự ly/tuyến đường, số lượng đơn đang giao, và đánh giá hiệu suất.
    """
    order = db.query(DonHang).filter(DonHang.id == order_id).first()
    if not order:
        raise ValueError(f"Không tìm thấy đơn hàng với id {order_id}")

    order_weight = float(order.khoi_luong_kg or 1.0)
    drivers = db.query(TaiXe).all()

    recommendations: List[DriverRecommendation] = []

    for driver in drivers:
        # 1. Tính toán tải trọng thực tế và số đơn đang giao
        active_orders = db.query(DonHang).filter(
            DonHang.tai_xe_id == driver.id,
            DonHang.trang_thai.in_(["DA_LAY_HANG", "DANG_GIAO"])
        ).all()

        active_count = len(active_orders)
        current_weight = sum(float(o.khoi_luong_kg or 0.0) for o in active_orders)
        driver_capacity = float(driver.tai_trong_kg or 1250.0)
        remaining_capacity = max(0.0, driver_capacity - current_weight)

        # 2. Tính điểm phù hợp (Match Score từ 10 đến 99)
        score = 60
        reasons = []

        # Tình trạng hoạt động
        if driver.trang_thai_hoat_dong == "SAN_SANG":
            score += 15
            reasons.append("Tài xế đang sẵn sàng nhận đơn")
        elif driver.trang_thai_hoat_dong == "DANG_GIAO":
            score += 5
            reasons.append(f"Đang chạy ca ({active_count} đơn đang giao)")
        else:
            score -= 40
            reasons.append("Tài xế đang trong trạng thái nghỉ")

        # Kiểm tra sức chứa thùng xe
        if remaining_capacity >= order_weight:
            score += 15
            reasons.append(f"Thùng xe còn trống {remaining_capacity:g} kg (đủ tải chở kiện {order_weight:g} kg)")
        else:
            score -= 45
            reasons.append(f"Thùng xe không đủ tải (còn {remaining_capacity:g} kg < {order_weight:g} kg)")

        # Cân bằng tải số lượng đơn
        if active_count == 0:
            score += 10
            reasons.append("Chưa có đơn nào trong ca (ưu tiên nhận đơn mới)")
        elif active_count <= 2:
            score += 5
            reasons.append(f"Tải nhẹ ({active_count} đơn), giao hàng nhanh")
        elif active_count >= 5:
            score -= 15
            reasons.append("Đang phụ trách nhiều đơn, nguy cơ trễ hẹn")

        # Khớp tuyến đường giao
        same_route_orders = [o for o in active_orders if o.tuyen_giao_id == order.tuyen_giao_id or o.nguoi_nhan_tinh_thanh == order.nguoi_nhan_tinh_thanh]
        if same_route_orders or (order.tuyen_giao and "nội thành" in order.tuyen_giao.ten_tuyen.lower()):
            score += 10
            reasons.append("Tuyến giao phù hợp lộ trình di chuyển")

        # Đánh giá uy tín
        danh_gia = float(driver.danh_gia or 5.0)
        if danh_gia >= 4.8:
            score += 5
            reasons.append(f"Đánh giá uy tín cao ({danh_gia:g}★)")

        # Hỏa tốc / Ưu tiên cao
        if order.muc_do_uu_tien in ["HOA_TOC", "CAO"] and active_count == 0:
            score += 10
            reasons.append("Ưu tiên xử lý đơn hỏa tốc / ưu tiên cao")

        final_score = max(15, min(99, score))

        recommendations.append(DriverRecommendation(
            tai_xe_id=driver.id,
            ho_ten=driver.ho_ten,
            so_dien_thoai=driver.so_dien_thoai,
            bien_so_xe=driver.bien_so_xe,
            loai_xe=driver.loai_xe or "Xe tải chuyên dụng",
            danh_gia=danh_gia,
            trang_thai_hoat_dong=driver.trang_thai_hoat_dong or "SAN_SANG",
            match_score=final_score,
            tai_trong_con_lai_kg=round(remaining_capacity, 1),
            so_don_dang_giao=active_count,
            ly_do_de_xuat=" • ".join(reasons),
            is_top_choice=False
        ))

    # Sắp xếp theo match_score giảm dần
    recommendations.sort(key=lambda r: r.match_score, reverse=True)

    top_id = None
    ai_summary = "Không có tài xế phù hợp khả dụng."
    if recommendations:
        top_driver = recommendations[0]
        top_id = top_driver.tai_xe_id
        top_driver.is_top_choice = True
        ai_summary = (
            f"AI đề xuất tài xế **{top_driver.ho_ten}** ({top_driver.bien_so_xe}) với mức độ phù hợp **{top_driver.match_score}%**. "
            f"Lý do: {top_driver.ly_do_de_xuat}."
        )

    return DriverRecommendationResponse(
        order_id=order.id,
        ma_van_don=order.ma_van_don,
        khoi_luong_kg=order_weight,
        muc_do_uu_tien=order.muc_do_uu_tien or "CHUAN",
        top_recommended_driver_id=top_id,
        ai_summary=ai_summary,
        recommendations=recommendations
    )
