import React, { useState, useRef } from 'react';
import kohyoungLogo from '../logo/KohyoungLogo.jpg';

const UserForm = () => {
  const [formData, setFormData] = useState({
    subject: '',
    requester: '',
    company: '',
    serialNumber: '',
    email: '',
    note: '',
    isMesRelated: false,
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, text: '', type: '' });
  
  // State lưu thông tin ticket trả về từ server để hiển thị sau khi gửi thành công
  const [submittedTicket, setSubmittedTicket] = useState(null);
  
  const topRef = useRef(null);
  const fileInputRef = useRef(null);

  const showSnackbarMsg = (text, type = 'success') => {
    setSnackbar({ show: true, text, type });
    setTimeout(() => {
      setSnackbar({ show: false, text: '', type: '' });
    }, 3000);
  };

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTriggerSelectImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

          setImagePreviews((prev) => [...prev, compressedBase64]);

          setFormData((prev) => ({
            ...prev,
            images: [
              ...prev.images,
              { name: file.name, type: 'image/jpeg', content: compressedBase64 }
            ],
          }));
        };
        img.src = uploadEvent.target.result;
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
    setImagePreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const executeSubmit = async () => {
    try {
      const payload = {
        platform: '#KYV_WebForm',
        subject: formData.subject,
        requester: formData.requester,
        company: formData.company,
        serialNumber: formData.serialNumber,
        email: formData.email,
        isMesRelated: formData.isMesRelated,
        note: formData.note.trim(),
        images: formData.images
      };

      console.log('--- BẮT ĐẦU GỬI PAYLOAD ---', payload);

      const response = await fetch('https://kyv.kyv-helpdesk.workers.dev/submit-helpdesk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log(`Phản hồi từ Worker [Status ${response.status}]:`, responseText);

      if (!response.ok) {
        throw new Error(`Server error (${response.status}): ${responseText}`);
      }

      // Parse JSON trả về từ Worker để lấy mã ticket và đường dẫn
      let resultData = {};
      try {
        resultData = JSON.parse(responseText);
      } catch (e) {
        console.warn("Không parse được JSON từ response text");
      }

      // Lưu lại thông tin ticket để hiển thị màn hình thành công
      setSubmittedTicket({
        ticketNumber: resultData.ticketNumber || 'N/A',
        ticketUrl: resultData.ticketUrl || ''
      });

      showSnackbarMsg('Gửi thông tin thành công / Submission successful!', 'success');
      
      // Reset form trạng thái
      setFormData({ subject: '', requester: '', company: '', serialNumber: '', email: '', note: '', isMesRelated: false, images: [] });
      setImagePreviews([]);
      setIsReviewing(false);
      scrollToTop();
    } catch (error) {
      console.error('LỖI CHI TIẾT TẠI executeSubmit:', error);
      showSnackbarMsg(`Lỗi: ${error.message || 'Có lỗi xảy ra'}`, 'error');
    }
  };

  const handleSubmit = () => {
    if (!formData.requester || !formData.company || !formData.email || !formData.subject || !formData.note) {
      showSnackbarMsg('Vui lòng điền đầy đủ các trường bắt buộc (*) / Please fill in all required fields (*)', 'warning');
      return;
    }

    if (formData.images.length === 0) {
      setShowConfirmModal(true);
    } else {
      setIsReviewing(true);
      setTimeout(scrollToTop, 50);
    }
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    scrollToTop();
  };

  return (
    <div style={{ backgroundColor: '#f4f6f5', minHeight: '100vh', padding: '16px 8px', boxSizing: 'border-box' }}>
      <div ref={topRef} />

      {/* Snackbar thông báo */}
      {snackbar.show && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: snackbar.type === 'error' ? '#ef4444' : snackbar.type === 'warning' ? '#f59e0b' : '#6CBC6C',
          color: '#fff', padding: '10px 20px', borderRadius: '6px', zIndex: 1000, fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {snackbar.text}
        </div>
      )}

      {/* Modal xác nhận */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: '15px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>Xác nhận / Confirmation</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px', lineHeight: '1.5' }}>Bạn chưa đính kèm hình ảnh. Bạn có muốn tiếp tục không? / No images attached. Do you want to continue?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowConfirmModal(false)} style={{ padding: '8px 16px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setShowConfirmModal(false); setIsReviewing(true); setTimeout(scrollToTop, 50); }} style={{ padding: '8px 16px', background: '#6CBC6C', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Container chính */}
      <div style={{ width: '100%', maxWidth: '650px', margin: '0 auto', backgroundColor: '#ffffff', padding: '20px 16px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', textAlign: 'left', boxSizing: 'border-box' }}>
        
        {/* Logo & Tiêu đề giữ căn giữa */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img src={kohyoungLogo} alt="Kohyoung Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </div>

        <h2 style={{ textAlign: 'center', color: '#2c3e50', fontWeight: 'bold', marginBottom: '6px', fontSize: '20px' }}>
          KYV Helpdesk <span style={{ color: '#6CBC6C' }}>Web Submit Form</span>
        </h2>

        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#7f8c8d', fontStyle: 'italic', display: 'block', padding: '0 5px' }}>
            * là phần bắt buộc phải điền / Required fields / *표시된 항목은 필수 입력 항목입니다
          </span>
        </div>

        {submittedTicket ? (
          /* MÀN HÌNH HIỂN THỊ KHI GỬI THÀNH CÔNG (GỌN GÀNG, CHUYÊN NGHIỆP) */
          <div style={{ textAlign: 'center', padding: '15px 0' }}>
            <h3 style={{ color: '#27ae60', marginBottom: '6px', fontSize: '18px', fontWeight: '600' }}>Gửi yêu cầu thành công</h3>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>Yêu cầu hỗ trợ của bạn đã được ghi nhận vào hệ thống Helpdesk.</p>
            
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                <b>Mã Ticket / Ticket Number:</b> <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{submittedTicket.ticketNumber}</span>
              </div>
              {submittedTicket.ticketUrl ? (
                <div style={{ fontSize: '14px', wordBreak: 'break-all' }}>
                  <b>Đường dẫn Ticket / Link:</b> <a href={submittedTicket.ticketUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Xem chi tiết Ticket trên hệ thống</a>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#888', fontStyle: 'italic' }}>Đang khởi tạo liên kết ticket...</div>
              )}
            </div>

            <button 
              onClick={handleResetForm}
              style={{ width: '100%', padding: '12px', backgroundColor: '#6CBC6C', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' }}
            >
              Gửi yêu cầu khác / Submit Another Request
            </button>
          </div>
        ) : isReviewing ? (
          /* MÀN HÌNH REVIEW TRƯỚC KHI GỬI */
          <div>
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <h3 style={{ color: '#333', fontWeight: 'bold', marginBottom: '4px' }}>Kiểm tra lại thông tin</h3>
              <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>Review Information</span>
            </div>

            <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0', wordBreak: 'break-word', boxSizing: 'border-box' }}>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}><b>Tên người yêu cầu / Requester:</b> {formData.requester}</div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}><b>Tên công ty / Company:</b> {formData.company}</div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}><b>Email:</b> {formData.email}</div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}><b>Serial Number Máy / Machine Serial:</b> {formData.serialNumber || '(Không có / None)'}</div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}><b>Liên quan tới MES / MES issue:</b> {formData.isMesRelated ? 'Có / Yes' : 'Không / No'}</div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}><b>Tiêu đề vấn đề / Subject:</b> {formData.subject}</div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}><b>Mô tả lỗi / Description:</b> {formData.note}</div>
              <div>
                <span style={{ fontSize: '13px' }}><b>Hình ảnh đính kèm / Attached Images:</b> {imagePreviews.length} ảnh / images</span>
                {imagePreviews.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {imagePreviews.map((src, index) => (
                      <img key={index} src={src} alt={`preview-${index}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ccc' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => { setIsReviewing(false); setTimeout(scrollToTop, 50); }} 
                style={{ flex: 1, padding: '12px', backgroundColor: '#4b5563', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Back
              </button>
              <button 
                onClick={executeSubmit} 
                style={{ flex: 1, padding: '12px', backgroundColor: '#6CBC6C', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          /* MÀN HÌNH FORM NHẬP LIỆU CHÍNH */
          <div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Tên người yêu cầu (Requester) *</label>
              <input type="text" value={formData.requester} onChange={(e) => handleChange('requester', e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '16px' }} />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Tên công ty (Company) *</label>
              <input type="text" value={formData.company} onChange={(e) => handleChange('company', e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '16px' }} />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Email *</label>
              <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '16px' }} />
              <span style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '4px', display: 'block' }}>
                * Vui lòng dùng email thật để nhận phản hồi kịp thời / Please use a valid email for timely feedback.
              </span>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Serial Number Máy (Machine Serial Number)</label>
              <input type="text" value={formData.serialNumber} onChange={(e) => handleChange('serialNumber', e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '16px' }} />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Đính kèm hình ảnh (Attach Images)</label>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                multiple 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              <button 
                type="button" 
                onClick={handleTriggerSelectImage} 
                style={{ marginBottom: '10px', backgroundColor: '#e2e8f0', color: '#1e293b', fontWeight: 'bold', width: '100%', padding: '11px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                📷 Chọn hình ảnh / Select Images
              </button>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {imagePreviews.map((src, index) => (
                  <div key={index} style={{ position: 'relative', width: '70px', height: '70px', display: 'inline-block' }}>
                    <img src={src} alt={`upload-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }} />
                    <button type="button" onClick={() => handleRemoveImage(index)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', lineHeight: '18px', textAlign: 'center', fontSize: '12px' }}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }} onClick={() => handleChange('isMesRelated', !formData.isMesRelated)}>
              <input 
                type="checkbox" 
                checked={formData.isMesRelated} 
                onChange={(e) => handleChange('isMesRelated', e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#6CBC6C', marginTop: '2px', flexShrink: 0 }}
              />
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#333', lineHeight: '1.4' }}>
                Có phải liên quan tới MES không / MES issue? (KY-MES, BRM, SECGEM, kbr AutoExport, API)
              </span>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Tiêu đề vấn đề (Subject) *</label>
              <input type="text" value={formData.subject} onChange={(e) => handleChange('subject', e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '16px' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Mô tả lỗi / vấn đề / câu hỏi (Description) *</label>
              <textarea 
                value={formData.note} 
                onChange={(e) => handleChange('note', e.target.value)} 
                rows={4}
                placeholder="Vui lòng mô tả chi tiết vấn đề, yêu cầu và câu hỏi bạn gặp phải..."
                style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none', resize: 'vertical', fontSize: '16px' }}
              />
            </div>

            <button 
              type="button" 
              onClick={handleSubmit} 
              style={{ width: '100%', padding: '13px', backgroundColor: '#6CBC6C', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' }}
            >
              Gửi / Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserForm;