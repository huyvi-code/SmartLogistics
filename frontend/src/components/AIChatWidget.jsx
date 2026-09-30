import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../api';
import {
  MessageSquare, X, Send, Bot, Sparkles, Package, MapPin,
  Clock, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Minimize2
} from 'lucide-react';

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Xin chào! Tôi là **Trợ lý AI & Chăm Sóc Khách Hàng SmartLogistics** 🤖.\n\nTôi sẵn sàng hỗ trợ bạn 24/7 về mọi dịch vụ vận chuyển:\n• 🔍 **Tra cứu vận đơn tức thì:** Nhập mã đơn (VD: `VN2026-8801` hoặc `8803`)\n• 📦 **Đóng gói hàng hóa:** Quy chuẩn bọc đồ dễ vỡ, chất lỏng, điện tử\n• 🛡️ **Bồi thường & khiếu nại:** Quy định đền bù khi mất mát, hư hỏng\n• 💳 **Lịch đối soát COD:** Thời gian nhận tiền thu hộ vào tài khoản\n• ⏰ **Giờ làm việc bưu cục & Hotline tổng đài CSKH 1900-8800**\n\nHãy gửi mã vận đơn hoặc bấm chọn câu hỏi dưới đây nhé!',
      suggestedActions: [
        'Tra cứu đơn VN2026-8801',
        'Đóng gói hàng dễ vỡ',
        'Chính sách bồi thường',
        'Lịch đối soát COD',
        'Quy định xem hàng',
        'Giờ làm việc & Hotline'
      ],
      relatedOrder: null,
      time: new Date()
    }
  ]);


  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(query);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.reply,
        suggestedActions: res.suggested_actions || [],
        relatedOrder: res.related_order || null,
        time: new Date()
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Xin lỗi, hiện tại Trợ lý AI đang bận. Bạn vui lòng thử lại sau ít giây.',
          suggestedActions: ['Tra cứu đơn VN2026-8801'],
          relatedOrder: null,
          time: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + ' đ';

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl shadow-orange-500/30 flex items-center gap-2.5 transition transform hover:scale-105 cursor-pointer"
          title="Mở Trợ lý AI Tra cứu Vận đơn"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white"></span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-extrabold tracking-wide uppercase flex items-center gap-1">
              AI Copilot <Sparkles className="w-3 h-3 text-amber-200" />
            </div>
            <div className="text-[11px] text-orange-100 font-medium">Tra cứu & Tư vấn</div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 transition-colors duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  Trợ Lý AI SmartLogistics
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                </div>
                <div className="text-[10px] text-orange-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Tra cứu tự động & tư vấn 24/7
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer"
                title="Thu nhỏ"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick CSKH Navigation Bar */}
          <div className="bg-slate-100 dark:bg-slate-800/80 px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
            <span className="text-slate-400 font-semibold text-[10px] shrink-0">Chủ đề CSKH:</span>
            {[
              { label: '🔍 Tra đơn 8801', query: 'Tra cứu đơn VN2026-8801' },
              { label: '📦 Đóng gói hàng', query: 'Hướng dẫn đóng gói hàng dễ vỡ' },
              { label: '🛡️ Bồi thường', query: 'Chính sách bồi thường khi mất hàng' },
              { label: '💳 Đối soát COD', query: 'Lịch đối soát và thanh toán tiền COD' },
              { label: '🚫 Hàng cấm', query: 'Quy định hàng cấm gửi' },
              { label: '🔍 Xem hàng', query: 'Quy định cho xem hàng và đồng kiểm' },
              { label: '⏰ Hotline CSKH', query: 'Giờ làm việc bưu cục và hotline tổng đài' },
            ].map((topic, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(topic.query)}
                className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition cursor-pointer shrink-0 text-[10px] font-medium"
              >
                {topic.label}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-slate-50 dark:bg-slate-950/50">

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl whitespace-pre-line leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-orange-500 text-white rounded-br-xs shadow-sm font-medium'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Related Order Card inside Chat */}
                {msg.relatedOrder && (
                  <div className="mt-2.5 max-w-[90%] w-full bg-white dark:bg-slate-900 border border-orange-500/30 p-3.5 rounded-2xl shadow-sm space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="font-mono font-bold text-orange-600 dark:text-orange-400 text-xs">
                        {msg.relatedOrder.ma_van_don}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {msg.relatedOrder.trang_thai}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <div>Người nhận: <strong>{msg.relatedOrder.nguoi_nhan_ten}</strong> ({msg.relatedOrder.nguoi_nhan_sdt})</div>
                      <div className="text-slate-500 dark:text-slate-400 truncate">Giao đến: {msg.relatedOrder.nguoi_nhan_dia_chi}, {msg.relatedOrder.nguoi_nhan_tinh_thanh}</div>
                      <div className="flex justify-between pt-1 font-semibold text-slate-700 dark:text-slate-200">
                        <span>Cước: {formatVND(msg.relatedOrder.cuoc_phi_van_chuyen)}</span>
                        <span className="text-amber-600 dark:text-amber-400">COD: {formatVND(msg.relatedOrder.tien_thu_ho_cod)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Prompt suggestion chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(act)}
                        className="px-2.5 py-1 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-[10px] font-semibold transition cursor-pointer flex items-center gap-1"
                      >
                        {act} <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-500" />
                <span>AI đang tra cứu dữ liệu...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập mã vận đơn (VD: VN2026-8801) hoặc câu hỏi..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || loading}
                className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition disabled:opacity-40 cursor-pointer shadow-sm"
                title="Gửi"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-1.5">
              Hỗ trợ bởi AI Engine SmartLogistics TMS
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
