import React, { useState, useRef, useEffect } from 'react';
import kohyoungLogo from '../logo/KohyoungLogo.jpg';

const UserForm = () => {
  const [lang, setLang] = useState('VIE'); // Mặc định tiếng Việt: VIE, ENG, CHN, KOR
  const [showLangMenu, setShowLangMenu] = useState(false); // Trạng thái mở/đóng menu chọn ngôn ngữ

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, text: '', type: '' });
  
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const topRef = useRef(null);
  const fileInputRef = useRef(null);
  const langMenuRef = useRef(null);

  // Từ điển đa ngôn ngữ
  const t = {
    VIE: {
      title: 'Web Submit Form',
      requiredNote: '* là phần bắt buộc phải điền',
      requester: 'Tên người yêu cầu',
      company: 'Tên công ty',
      email: 'Email',
      emailNote: '* Vui lòng dùng email thật để nhận phản hồi kịp thời',
      serialNumber: 'Serial Number Máy',
      attachImages: 'Đính kèm hình ảnh',
      selectImages: 'Chọn hình ảnh',
      mesCheck: 'Có phải liên quan tới MES không? (KY-MES, BRM, SECGEM, kbr AutoExport, API)',
      subject: 'Tiêu đề vấn đề',
      description: 'Mô tả lỗi / vấn đề / câu hỏi',
      descPlaceholder: 'Vui lòng mô tả chi tiết vấn đề, yêu cầu và câu hỏi bạn gặp phải... (Có thể dán ảnh trực tiếp Ctrl+V)',
      submit: 'Gửi',
      submitting: 'Đang gửi yêu cầu...',
      reviewTitle: 'Kiểm tra lại thông tin',
      back: 'Quay lại',
      send: 'Send',
      successMsg: 'Gửi thông tin thành công!',
      errorMsg: 'Có lỗi xảy ra',
      warningMsg: 'Vui lòng điền đầy đủ các trường bắt buộc (*)',
      confirmTitle: 'Xác nhận',
      confirmDesc: 'Bạn chưa đính kèm hình ảnh. Bạn có muốn tiếp tục không?',
      cancel: 'Hủy',
      ok: 'OK',
      ticketNum: 'Mã Ticket',
      copyUrl: 'Copy URL Ticket',
      copiedUrl: '✓ Đã Copy URL',
      initLink: 'Đang khởi tạo liên kết ticket...',
      anotherReq: 'Gửi yêu cầu khác',
      attachedImagesLabel: 'Hình ảnh đính kèm',
      imagesCount: 'ảnh',
      none: '(Không có)'
    },
    ENG: {
      title: 'Web Submit Form',
      requiredNote: '* Required fields',
      requester: 'Requester Name',
      company: 'Company Name',
      email: 'Email',
      emailNote: '* Please use a valid email for timely feedback',
      serialNumber: 'Machine Serial Number',
      attachImages: 'Attach Images',
      selectImages: 'Select Images',
      mesCheck: 'MES issue? (KY-MES, BRM, SECGEM, kbr AutoExport, API)',
      subject: 'Subject',
      description: 'Description / Issue Details',
      descPlaceholder: 'Please describe the problem, request, or question in detail... (Paste images with Ctrl+V)',
      submit: 'Submit',
      submitting: 'Submitting...',
      reviewTitle: 'Review Information',
      back: 'Back',
      send: 'Send',
      successMsg: 'Submission successful!',
      errorMsg: 'An error occurred',
      warningMsg: 'Please fill in all required fields (*)',
      confirmTitle: 'Confirmation',
      confirmDesc: 'No images attached. Do you want to continue?',
      cancel: 'Cancel',
      ok: 'OK',
      ticketNum: 'Ticket Number',
      copyUrl: 'Copy URL Ticket',
      copiedUrl: '✓ URL Copied',
      initLink: 'Initializing ticket link...',
      anotherReq: 'Submit Another Request',
      attachedImagesLabel: 'Attached Images',
      imagesCount: 'images',
      none: '(None)'
    },
    CHN: {
      title: '网页提交表单',
      requiredNote: '* 为必填项',
      requester: '提单人',
      company: '公司名称',
      email: 'Email',
      emailNote: '* 请使用真实邮箱以便及时收到回复',
      serialNumber: '机器 Serial Number',
      attachImages: '附件图片',
      selectImages: '选择图片',
      mesCheck: '是否与 MES 相关？ (KY-MES, BRM, SECGEM, kbr AutoExport, API)',
      subject: '主题',
      description: '问题描述',
      descPlaceholder: '请详细描述您遇到的问题、需求或疑问... (支持 Ctrl+V 粘贴截图)',
      submit: '提交',
      submitting: '正在提交...',
      reviewTitle: '确认信息',
      back: '返回',
      send: '发送',
      successMsg: '提交成功！',
      errorMsg: '发生错误',
      warningMsg: '请填写所有必填字段 (*)',
      confirmTitle: '确认',
      confirmDesc: '您尚未附加图片。是否继续？',
      cancel: '取消',
      ok: '确定',
      ticketNum: '工单号',
      copyUrl: '复制 URL Ticket',
      copiedUrl: '✓ 已复制链接',
      initLink: '正在初始化工单链接...',
      anotherReq: '提交其他请求',
      attachedImagesLabel: '附件图片',
      imagesCount: '张',
      none: '(无)'
    },
    KOR: {
      title: '웹 제출 양식',
      requiredNote: '* 필수 입력 항목',
      requester: '요청자 이름',
      company: '회사명',
      email: 'Email',
      emailNote: '* 신속한 피드백을 위해 실제 유효한 이메일을 입력해 주세요',
      serialNumber: '장비 Serial Number',
      attachImages: '이미지 첨부',
      selectImages: '이미지 선택',
      mesCheck: 'MES 관련 이슈인가요? (KY-MES, BRM, SECGEM, kbr AutoExport, API)',
      subject: '제목',
      description: '문제 설명',
      descPlaceholder: '문제, 요청 사항 또는 질문을 자세히 설명해 주세요... (Ctrl+V로 이미지 붙여넣기 가능)',
      submit: '제출',
      submitting: '제출 중...',
      reviewTitle: '정보 확인',
      back: '뒤로',
      send: '보내기',
      successMsg: '성공적으로 제출되었습니다!',
      errorMsg: '오류가 발생했습니다',
      warningMsg: '필수 항목(*)을 모두 입력해 주세요.',
      confirmTitle: '확인',
      confirmDesc: '첨부된 이미지가 없습니다. 계속하시겠습니까?',
      cancel: '취소',
      ok: '확인',
      ticketNum: 'Ticket 번호',
      copyUrl: 'Copy URL Ticket',
      copiedUrl: '✓ URL 복사됨',
      initLink: 'Ticket 링크 초기화 중...',
      anotherReq: '다른 요청 제출하기',
      attachedImagesLabel: '첨부된 이미지',
      imagesCount: '장',
      none: '(없음)'
    }
  };

  const currentTexts = t[lang];

  // Đóng menu ngôn ngữ khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const processImageFile = (file) => {
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
            { name: file.name || `pasted_image_${Date.now()}.jpg`, type: 'image/jpeg', content: compressedBase64 }
          ],
        }));
      };
      img.src = uploadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    files.forEach((file) => processImageFile(file));
    e.target.value = '';
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          e.preventDefault();
          processImageFile(blob);
          // Đã lược bỏ gọi hàm thông báo (showSnackbarMsg) khi dán ảnh
        }
      }
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
    setImagePreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const executeSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
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

      const response = await fetch('https://kyv.kyv-helpdesk.workers.dev/submit-helpdesk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Server error (${response.status}): ${responseText}`);
      }

      let resultData = {};
      try {
        resultData = JSON.parse(responseText);
      } catch (e) {
        console.warn("Không parse được JSON từ response text");
      }

      const ticketNum = resultData.ticketNumber || 'N/A';
      const ticketUrl = ticketNum !== 'N/A' 
        ? `https://help.kohyoung.com/a/tickets/${ticketNum}` 
        : (resultData.ticketUrl || '');

      setSubmittedTicket({
        ticketNumber: ticketNum,
        ticketUrl: ticketUrl
      });

      showSnackbarMsg(currentTexts.successMsg, 'success');
      
      setFormData({ subject: '', requester: '', company: '', serialNumber: '', email: '', note: '', isMesRelated: false, images: [] });
      setImagePreviews([]);
      setCopied(false);
      setIsReviewing(false);
      scrollToTop();
    } catch (error) {
      console.error('LỖI CHI TIẾT TẠI executeSubmit:', error);
      showSnackbarMsg(`${currentTexts.errorMsg}: ${error.message || ''}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.requester || !formData.company || !formData.email || !formData.subject || !formData.note) {
      showSnackbarMsg(currentTexts.warningMsg, 'warning');
      return;
    }

    if (formData.images.length === 0) {
      setShowConfirmModal(true);
    } else {
      setIsReviewing(true);
      setTimeout(scrollToTop, 50);
    }
  };

  const handleCopyUrl = () => {
    if (submittedTicket && submittedTicket.ticketUrl) {
      navigator.clipboard.writeText(submittedTicket.ticketUrl)
        .then(() => {
          setCopied(true);
          showSnackbarMsg(currentTexts.copiedUrl, 'success');
          setTimeout(() => setCopied(false), 2500);
        })
        .catch(err => {
          console.error('Không copy được:', err);
        });
    }
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setCopied(false);
    scrollToTop();
  };

  return (
    <div style={{ backgroundColor: '#f4f6f5', minHeight: '100vh', padding: '16px 8px', boxSizing: 'border-box' }}>
      <div ref={topRef} />

      {snackbar.show && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: snackbar.type === 'error' ? '#ef4444' : snackbar.type === 'warning' ? '#f59e0b' : '#6CBC6C',
          color: '#fff', padding: '10px 20px', borderRadius: '6px', zIndex: 1000, fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {snackbar.text}
        </div>
      )}

      {showConfirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: '15px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>{currentTexts.confirmTitle}</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px', lineHeight: '1.5' }}>{currentTexts.confirmDesc}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowConfirmModal(false)} style={{ padding: '8px 16px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>{currentTexts.cancel}</button>
              <button onClick={() => { setShowConfirmModal(false); setIsReviewing(true); setTimeout(scrollToTop, 50); }} style={{ padding: '8px 16px', background: '#6CBC6C', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{currentTexts.ok}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '650px', margin: '0 auto', backgroundColor: '#ffffff', padding: '20px 16px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', textAlign: 'left', boxSizing: 'border-box' }}>
        
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
          <img src={kohyoungLogo} alt="Kohyoung Logo" style={{ height: '40px', objectFit: 'contain' }} />

          <div ref={langMenuRef} style={{ position: 'absolute', right: 0 }}>
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                fontSize: '13px',
                fontWeight: 'bold',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#334155',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              🌐 {lang} ▾
            </button>

            {showLangMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                zIndex: 50,
                minWidth: '80px'
              }}>
                {['VIE', 'ENG', 'CHN', 'KOR'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setLang(item);
                      setShowLangMenu(false);
                    }}
                    style={{
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: lang === item ? 'bold' : 'normal',
                      border: 'none',
                      backgroundColor: lang === item ? '#6CBC6C' : 'transparent',
                      color: lang === item ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s'
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <h2 style={{ textAlign: 'center', color: '#2c3e50', fontWeight: 'bold', marginBottom: '6px', fontSize: '20px' }}>
          KYV Helpdesk <span style={{ color: '#6CBC6C' }}>{currentTexts.title}</span>
        </h2>

        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#7f8c8d', fontStyle: 'italic', display: 'block', padding: '0 5px' }}>
            {currentTexts.requiredNote}
          </span>
        </div>

        {submittedTicket ? (
          <div style={{ textAlign: 'center', padding: '15px 0' }}>
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ marginBottom: '12px', fontSize: '14px' }}>
                <b>{currentTexts.ticketNum}:</b> <span style={{ color: '#6CBC6C', fontWeight: 'bold' }}>{submittedTicket.ticketNumber}</span>
              </div>
              {submittedTicket.ticketUrl ? (
                <div>
                  <div style={{ fontSize: '14px', wordBreak: 'break-all', marginBottom: '10px', color: '#334155', userSelect: 'all', cursor: 'default' }}>
                    {submittedTicket.ticketUrl}
                  </div>
                  <button 
                    type="button"
                    onClick={handleCopyUrl}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#6CBC6C',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {copied ? currentTexts.copiedUrl : currentTexts.copyUrl}
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#888', fontStyle: 'italic' }}>{currentTexts.initLink}</div>
              )}
            </div>

            <button 
              onClick={handleResetForm}
              style={{ width: '100%', padding: '12px', backgroundColor: '#6CBC6C', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' }}
            >
              {currentTexts.anotherReq}
            </button>
          </div>
        ) : isReviewing ? (
          <div style={{ opacity: isSubmitting ? 0.6 : 1, pointerEvents: isSubmitting ? 'none' : 'auto' }}>
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <h3 style={{ color: '#333', fontWeight: 'bold', marginBottom: '4px' }}>{currentTexts.reviewTitle}</h3>
            </div>

            <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0', wordBreak: 'break-word', boxSizing: 'border-box' }}>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}><b>{currentTexts.requester}:</b> {formData.requester}</div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}><b>{currentTexts.company}:</b> {formData.company}</div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}><b>Email:</b> {formData.email}</div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}><b>Serial Number:</b> {formData.serialNumber || currentTexts.none}</div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}><b>MES:</b> {formData.isMesRelated ? 'Yes / 是 / 예' : 'No / 否 / 아니오'}</div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}><b>{currentTexts.subject}:</b> {formData.subject}</div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}><b>{currentTexts.description}:</b> {formData.note}</div>
              <div>
                <span style={{ fontSize: '13px' }}><b>{currentTexts.attachedImagesLabel}:</b> {imagePreviews.length} {currentTexts.imagesCount}</span>
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
                type="button"
                disabled={isSubmitting}
                onClick={() => { setIsReviewing(false); setTimeout(scrollToTop, 50); }} 
                style={{ flex: 1, padding: '12px', backgroundColor: '#4b5563', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {currentTexts.back}
              </button>
              <button 
                type="button"
                disabled={isSubmitting}
                onClick={executeSubmit} 
                style={{ flex: 1, padding: '12px', backgroundColor: isSubmitting ? '#93c5fd' : '#6CBC6C', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: isSubmitting ? 'wait' : 'pointer' }}
              >
                {isSubmitting ? currentTexts.submitting : currentTexts.send}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                {currentTexts.requester} *
              </label>
              <input type="text" value={formData.requester} onChange={(e) => handleChange('requester', e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '16px' }} />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                {currentTexts.company} *
              </label>
              <input type="text" value={formData.company} onChange={(e) => handleChange('company', e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '16px' }} />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                Email *
              </label>
              <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '16px' }} />
              <span style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '4px', display: 'block' }}>
                {currentTexts.emailNote}
              </span>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                {currentTexts.serialNumber}
              </label>
              <input type="text" value={formData.serialNumber} onChange={(e) => handleChange('serialNumber', e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '16px' }} />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                {currentTexts.attachImages}
              </label>
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
                style={{ marginBottom: '8px', backgroundColor: '#e2e8f0', color: '#1e293b', fontWeight: 'bold', width: '100%', padding: '11px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                📷 {currentTexts.selectImages}
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
                {currentTexts.mesCheck}
              </span>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                {currentTexts.subject} *
              </label>
              <input type="text" value={formData.subject} onChange={(e) => handleChange('subject', e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '16px' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                {currentTexts.description} *
              </label>
              <textarea 
                value={formData.note} 
                onChange={(e) => handleChange('note', e.target.value)} 
                onPaste={handlePaste}
                rows={4}
                placeholder={currentTexts.descPlaceholder}
                style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none', resize: 'vertical', fontSize: '16px' }}
              />
            </div>

            <button 
              type="button" 
              onClick={handleSubmit} 
              style={{ width: '100%', padding: '13px', backgroundColor: '#6CBC6C', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' }}
            >
              {currentTexts.submit}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserForm;