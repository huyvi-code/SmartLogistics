from app.schemas.schemas import FeeCalculationRequest, FeeCalculationResponse

NORTH_ZONES = {
    "hà nội", "hải phòng", "quảng ninh", "bắc ninh", "hải dương", "hưng yên",
    "nam định", "ninh bình", "hà nam", "thái nguyên", "phú thọ", "vĩnh phúc",
    "bắc giang", "lào cai", "yên bái", "hòa bình", "sơn la", "lạng sơn", "tuyên quang"
}
CENTRAL_ZONES = {
    "đà nẵng", "thừa thiên huế", "huế", "quảng nam", "quảng ngãi", "nghệ an",
    "thanh hóa", "hà tĩnh", "quảng bình", "quảng trị", "bình định", "khánh hòa", "phú yên", "nha trang"
}
SOUTH_ZONES = {
    "tp. hồ chí minh", "hồ chí minh", "tp hcm", "sài gòn", "bình dương", "đồng nai",
    "bà rịa - vũng tàu", "vũng tàu", "long an", "tiền giang", "cần thơ", "an giang",
    "kiên giang", "đồng tháp", "vĩnh long", "bến tre", "tây ninh", "bình phước"
}

def get_region(province: str) -> str:
    p = province.strip().lower()
    for z in NORTH_ZONES:
        if z in p or p in z:
            return "NORTH"
    for z in SOUTH_ZONES:
        if z in p or p in z:
            return "SOUTH"
    for z in CENTRAL_ZONES:
        if z in p or p in z:
            return "CENTRAL"
    return "OTHER"

def calculate_shipping_fee(req: FeeCalculationRequest) -> FeeCalculationResponse:
    sender_city = req.tinh_thanh_gui.strip().lower()
    receiver_city = req.tinh_thanh_nhan.strip().lower()

    # 1. Phí cơ bản phân định rõ: nội thành, liên tỉnh cùng miền, cận miền, và trục Bắc - Nam
    is_same_city = sender_city == receiver_city
    reg_send = get_region(sender_city)
    reg_recv = get_region(receiver_city)

    if is_same_city:
        phi_co_ban = 22000.0  # Nội thành / Cùng tỉnh thành
    elif reg_send == reg_recv and reg_send != "OTHER":
        phi_co_ban = 35000.0  # Cùng miền (vd: Hà Nội - Hải Phòng, TP.HCM - Cần Thơ)
    elif (reg_send == "NORTH" and reg_recv == "SOUTH") or (reg_send == "SOUTH" and reg_recv == "NORTH"):
        phi_co_ban = 75000.0  # Trục Bắc - Nam xuyên Việt (Hà Nội - TP.HCM)
    else:
        phi_co_ban = 55000.0  # Tuyến liên miền lân cận (Bắc - Trung hoặc Trung - Nam)

    # 2. Phí khối lượng vượt mức (> 1kg tính 5.000đ/kg)
    weight = max(req.khoi_luong_kg, 0.1)
    extra_kg = max(0.0, weight - 1.0)
    phi_khoi_luong = round(extra_kg * 5000.0, -2)

    # 3. Phí dịch vụ thu hộ COD (1% giá trị COD)
    phi_cod = round(req.tien_thu_ho_cod * 0.01, -2) if req.tien_thu_ho_cod > 0 else 0.0

    cuoc_phi_van_chuyen = phi_co_ban + phi_khoi_luong + phi_cod
    tong_tien_thu = req.tien_thu_ho_cod + cuoc_phi_van_chuyen

    return FeeCalculationResponse(
        phi_co_ban=phi_co_ban,
        phi_khoi_luong=phi_khoi_luong,
        phi_cod=phi_cod,
        cuoc_phi_van_chuyen=cuoc_phi_van_chuyen,
        tong_tien_thu=tong_tien_thu
    )
