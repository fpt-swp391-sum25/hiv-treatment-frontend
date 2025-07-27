import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { notification } from 'antd';
import { ScheduleStatus, SlotTimes, StatusMapping } from '../../../types/schedule.types';
import moment from 'moment';
import { deleteScheduleAPI, updateScheduleAPI, cancelBookingAPI } from '../../../services/api.service';
import axios from '../../../services/axios.customize';
import './ScheduleDetail.css';
import { BsCalendarWeek, BsClock, BsDoorOpen, BsPerson, BsBriefcase, BsPersonPlus, BsPersonDash, BsList } from 'react-icons/bs';

const ScheduleDetail = ({ show, onHide, schedule, onUpdate, onDelete, onShowToast, onRefreshData }) => {
    const [formData, setFormData] = useState({
        id: '',
        doctorId: '',
        doctorName: '',
        date: '',
        status: ScheduleStatus.AVAILABLE,
        slot: '',
        roomCode: '',
        original_status: ScheduleStatus.AVAILABLE,
        shiftType: null, // Thêm trường thông tin ca làm việc
        currentPatients: 0, // Thêm trường số bệnh nhân hiện tại
        maxPatients: 5 // Thêm trường số bệnh nhân tối đa
    });
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [schedules, setSchedules] = useState([]);
    
    // State cho modal quản lý sub-slots
    const [showSubSlots, setShowSubSlots] = useState(false);
    const [subSlots, setSubSlots] = useState([]);
    const [loadingSubSlots, setLoadingSubSlots] = useState(false);
    const [processingSubSlot, setProcessingSubSlot] = useState(null); // ID của sub-slot đang xử lý
    
    // State cho confirmation hủy sub-slot
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [selectedSubSlotToCancel, setSelectedSubSlotToCancel] = useState(null);

    // Sử dụng SlotTimes từ schedule.types.js
    const timeSlots = SlotTimes;
    
    // Định nghĩa ca sáng và ca chiều
    const morningShiftSlots = timeSlots.filter(slot => 
        ['08:00:00', '09:00:00', '10:00:00', '11:00:00'].includes(slot.value)
    );
    
    const afternoonShiftSlots = timeSlots.filter(slot => 
        ['13:00:00', '14:00:00', '15:00:00', '16:00:00'].includes(slot.value)
    );

    useEffect(() => {
        if (schedule) {
            console.log('ScheduleDetail: Received schedule data:', schedule);
            
            // Xác định shiftType từ trường type (theo phản hồi từ BE)
            let shiftTypeValue = null;
            if (schedule.type === 'morning' || schedule.type === 'afternoon') {
                shiftTypeValue = schedule.type;
            } else if (schedule.shiftType) {
                shiftTypeValue = schedule.shiftType;
            }
            
            setFormData({
                id: schedule.id,
                doctorId: schedule.doctorId,
                doctorName: schedule.doctorName,
                date: schedule.date,
                status: schedule.status,
                slot: schedule.slot || '08:00:00',
                roomCode: schedule.roomCode || '',
                original_status: schedule.original_status, // Lưu trạng thái gốc từ BE
                shiftType: shiftTypeValue, // Lấy từ type hoặc shiftType
                type: schedule.type, // Lưu trữ trường type gốc
                currentPatients: schedule.currentPatients || 0, // Lấy số bệnh nhân hiện tại
                maxPatients: schedule.maxPatients || 5 // Lấy số bệnh nhân tối đa
            });
        }
        
        // Reset confirmDelete state when modal is shown
        setConfirmDelete(false);
    }, [schedule, show]);

    // Kiểm tra xem slot có thuộc ca nào không nếu chưa có shiftType
    useEffect(() => {
        if (formData.slot && !formData.shiftType) {
            // Kiểm tra xem slot thuộc ca sáng hay ca chiều
            if (morningShiftSlots.some(item => item.value === formData.slot)) {
                setFormData(prev => ({...prev, shiftType: 'morning'}));
            } else if (afternoonShiftSlots.some(item => item.value === formData.slot)) {
                setFormData(prev => ({...prev, shiftType: 'afternoon'}));
            }
        }
    }, [formData.slot, formData.shiftType]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        console.log(`Field changed: ${name}, new value: ${value}`);
        
        // Xử lý đặc biệt cho trường roomCode
        let updatedValue = type === 'checkbox' ? checked : value;
        if (name === 'roomCode') {
            // Chỉ cho phép nhập số
            updatedValue = value.replace(/[^0-9]/g, '');
            
            // Giới hạn độ dài
            if (updatedValue.length > 3) {
                updatedValue = updatedValue.slice(0, 3);
            }
        }
        
        // Tạo bản sao của formData để cập nhật
        const updatedFormData = {
            ...formData,
            [name]: updatedValue
        };
        
        // Nếu thay đổi ca làm việc, cập nhật slot giờ tương ứng
        if (name === 'shiftType') {
            if (value === 'morning') {
                // Chọn slot đầu tiên của ca sáng
                updatedFormData.slot = '08:00:00';
            } else if (value === 'afternoon') {
                // Chọn slot đầu tiên của ca chiều
                updatedFormData.slot = '13:00:00';
            }
        }
        
        // Nếu thay đổi slot giờ, tự động cập nhật ca làm việc tương ứng
        if (name === 'slot') {
            if (morningShiftSlots.some(slot => slot.value === value)) {
                updatedFormData.shiftType = 'morning';
            } else if (afternoonShiftSlots.some(slot => slot.value === value)) {
                updatedFormData.shiftType = 'afternoon';
            } else {
                updatedFormData.shiftType = '';
            }
        }
        
        setFormData(updatedFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // DEBUG: Log dữ liệu form trước khi xử lý
        console.log('=== BẮT ĐẦU CẬP NHẬT LỊCH ===');
        console.log('1. Dữ liệu form:', formData);
        console.log('2. ID lịch cần cập nhật:', formData.id);
        
        if (!formData.slot && formData.status === "available") {
            onShowToast('Vui lòng chọn khung giờ làm việc', 'danger');
            return;
        }
        
        // Kiểm tra số phòng
        if (!formData.roomCode || formData.roomCode.trim() === '') {
            onShowToast('Vui lòng nhập số phòng', 'danger');
            return;
        }

        setLoading(true);
        try {
            // Kiểm tra và đảm bảo roomCode luôn có giá trị
            if (!formData.roomCode) {
                formData.roomCode = '101'; // Giá trị mặc định nếu không có
            }
            
            // DEBUG: Log thông tin quan trọng
            console.log('3. Thông tin phòng:', formData.roomCode);
            console.log('4. Ca làm việc:', formData.shiftType);
            console.log('5. Trạng thái:', formData.status);
            
            // Giữ nguyên trạng thái hiện tại
            const beStatus = formData.original_status || StatusMapping[formData.status] || formData.status;
            console.log('6. Trạng thái gửi lên server:', beStatus);
            
            // Cập nhật title dựa trên trạng thái
            let title = `${formData.doctorName} - ${formData.slot.substring(0, 5)} - P.${formData.roomCode}`;
            
            // Thêm thông tin ca làm việc vào title nếu có
            if (formData.shiftType) {
                const shiftName = formData.shiftType === 'morning' ? 'Ca sáng' : 'Ca chiều';
                title = `${formData.doctorName} - ${shiftName} - ${formData.slot.substring(0, 5)} - P.${formData.roomCode}`;
            }
            
            const updatedSchedule = {
                ...formData,
                title: title,
                original_status: beStatus,
                type: formData.shiftType
            };
            
            // DEBUG: Log dữ liệu cuối cùng trước khi gửi
            console.log('7. Dữ liệu cuối cùng sẽ gửi đi:', updatedSchedule);
            
            // Sử dụng setTimeout để tránh FlushSync error
            setTimeout(() => {
                try {
                    // DEBUG: Log thời điểm gọi hàm cập nhật
                    console.log('8. Bắt đầu gọi hàm cập nhật');
                    onUpdate(updatedSchedule);
                    handleClose();
                    console.log('=== KẾT THÚC CẬP NHẬT LỊCH ===');
                } catch (error) {
                    console.error('9. Lỗi khi gọi hàm cập nhật:', error);
                    onShowToast('Có lỗi xảy ra khi cập nhật lịch', 'danger');
                }
            }, 0);
        } catch (error) {
            console.error('10. Lỗi trong quá trình xử lý:', error);
            onShowToast('Có lỗi xảy ra khi cập nhật lịch', 'danger');
        } finally {
            setLoading(false);
        }
    };

    // Hiển thị xác nhận xóa
    const showDeleteConfirmation = () => {
        // Kiểm tra xem lịch có bệnh nhân đặt không
        const currentPatients = formData.currentPatients || 0;
        if (currentPatients > 0) {
            console.log('Schedule has patients, showing sub-slots modal:', currentPatients);
            // Hiển thị modal quản lý sub-slots thay vì thông báo lỗi
            showSubSlotsModal();
            return;
        }
        
        // Nếu không có bệnh nhân, hiển thị xác nhận xóa bình thường
        setConfirmDelete(true);
    };

    // Hủy xác nhận xóa
    const cancelDelete = () => {
        setConfirmDelete(false);
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            
            if (!schedule || !schedule.id) {
                console.error('Invalid schedule ID:', schedule);
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể xóa lịch: ID không hợp lệ',
                    placement: 'topRight',
                    duration: 3
                });
                return;
            }
            
            // Kiểm tra xem lịch có bệnh nhân đặt không
            const currentPatients = formData.currentPatients || 0;
            if (currentPatients > 0) {
                console.log('Cannot delete schedule with patients:', currentPatients);
                notification.warning({
                    message: 'Không thể xóa lịch',
                    description: `Lịch này đã có ${currentPatients} bệnh nhân đặt. Không thể xóa lịch đã có bệnh nhân.`,
                    placement: 'topRight',
                    duration: 5
                });
                setDeleting(false);
                setConfirmDelete(false);
                return;
            }
            
            // Gọi API để xóa lịch
            console.log('Deleting schedule:', schedule.id);
            
            try {
            const response = await deleteScheduleAPI(schedule.id);
            console.log('Delete response:', response);
            
                // Đóng modal trước
                onHide();
                
                // Sau đó thông báo cho component cha về việc xóa thành công
                // để component cha có thể cập nhật UI và làm mới dữ liệu
                onDelete(schedule.id);
                
            } catch (apiError) {
                console.error('API error when deleting schedule:', apiError);
                
                // Kiểm tra nếu lỗi 404 (không tìm thấy) - có thể lịch đã bị xóa trước đó
                if (apiError.response && apiError.response.status === 404) {
                    console.log('Schedule not found, may have been deleted already');
                onHide();
                    onDelete(schedule.id); // Vẫn gọi onDelete để cập nhật UI
                    return;
                }
                
                // Các lỗi khác
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể xóa lịch, vui lòng thử lại sau',
                    placement: 'topRight',
                    duration: 3
                });
            }
        } catch (error) {
            console.error('Error in handleDelete function:', error);
            notification.error({
                message: 'Lỗi',
                description: 'Đã xảy ra lỗi khi xử lý yêu cầu xóa',
                placement: 'topRight',
                duration: 3
            });
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    // Tạo danh sách sub-slots từ thông tin slot chính
    const generateSubSlots = () => {
        const slots = [];
        const maxPatients = formData.maxPatients || 4;
        const currentPatients = formData.currentPatients || 0;
        
        // Kiểm tra trạng thái của schedule từ database
        const scheduleStatus = schedule.status || formData.status;
        
        // Kiểm tra xem lịch có phải là ngày trong quá khứ không
        const scheduleDate = moment(schedule.date);
        const today = moment().startOf('day');
        const isPastDate = scheduleDate.isBefore(today);
        
        console.log('📅 Date validation:');
        console.log('- Schedule date:', scheduleDate.format('DD/MM/YYYY'));
        console.log('- Today:', today.format('DD/MM/YYYY'));
        console.log('- Is past date:', isPastDate);
        
        // Nếu lịch đã bị hủy, hiển thị tất cả slot như đã hủy
        if (scheduleStatus === "Đã hủy") {
            for (let i = 1; i <= maxPatients; i++) {
                if (i <= currentPatients) {
                    // Slot có bệnh nhân nhưng đã bị hủy
                    slots.push({
                        id: `${schedule.id}_${i}`,
                        slotNumber: i,
                        patientName: `Bệnh nhân ${i} (Đã hủy)`,
                        patientId: `patient_${i}`,
                        status: 'Đã hủy',
                        hasPatient: true,
                        canDelete: false, // KHÔNG thể xóa slot đã hủy
                        canCancel: false  // KHÔNG thể hủy lại
                    });
                } else {
                    // Slot trống
                    slots.push({
                        id: `${schedule.id}_${i}`,
                        slotNumber: i,
                        patientName: null,
                        patientId: null,
                        status: 'Trống',
                        hasPatient: false,
                        canDelete: true,
                        canCancel: false
                    });
                }
            }
        } else {
            // Lịch bình thường - tạo sub-slots có bệnh nhân (đang hoạt động)
            for (let i = 1; i <= currentPatients; i++) {
                slots.push({
                    id: `${schedule.id}_${i}`,
                    slotNumber: i,
                    patientName: `Bệnh nhân ${i}`,
                    patientId: `patient_${i}`,
                    status: 'Đang hoạt động',
                    hasPatient: true,
                    canDelete: false,
                    canCancel: !isPastDate // KHÔNG cho phép hủy lịch trong quá khứ
                });
            }
            
            // Tạo sub-slots trống
            for (let i = currentPatients + 1; i <= maxPatients; i++) {
                slots.push({
                    id: `${schedule.id}_${i}`,
                    slotNumber: i,
                    patientName: null,
                    patientId: null,
                    status: 'Trống',
                    hasPatient: false,
                    canDelete: true,
                    canCancel: false
                });
            }
        }
        
        return slots;
    };

    // Hiển thị modal quản lý sub-slots
    const showSubSlotsModal = () => {
        console.log("🔧 Showing sub-slots modal");
        setLoadingSubSlots(true);
        const slots = generateSubSlots();
        setSubSlots(slots);
        
        // Hiển thị modal sub-slots với delay nhỏ để tránh conflict
        setTimeout(() => {
            setShowSubSlots(true);
            setLoadingSubSlots(false);
        }, 100);
    };

    // Đóng modal sub-slots và hiển thị lại modal chính
    const closeSubSlotsModal = () => {
        console.log("🔧 Closing sub-slots modal");
        setShowSubSlots(false);
        
        // Reset tất cả states liên quan
        setShowCancelConfirm(false);
        setSelectedSubSlotToCancel(null);
        
        // Đặt lại state của sub-slots để sạch cho lần mở tiếp theo
        setTimeout(() => {
            setSubSlots([]);
            setLoadingSubSlots(false);
        }, 300); // Đợi animation modal đóng hoàn tất
    };

    // Hiển thị confirmation hủy sub-slot
    const showCancelSubSlotConfirmation = (subSlot) => {
       
        setSelectedSubSlotToCancel(subSlot);
        setShowCancelConfirm(true);
    };

    // Hủy confirmation hủy sub-slot
    const cancelSubSlotConfirmation = () => {
        console.log("🔧 Cancelling sub-slot confirmation");
        setShowCancelConfirm(false);
        setSelectedSubSlotToCancel(null);
    };

    // Xác nhận hủy sub-slot
    const confirmCancelSubSlot = async () => {
        if (selectedSubSlotToCancel) {
            console.log("🔧 Confirming cancel for sub-slot:", selectedSubSlotToCancel);
            setShowCancelConfirm(false);
            await handleCancelSubSlotWithCancelAPI(selectedSubSlotToCancel);
            setSelectedSubSlotToCancel(null);
        }
    };

    // Hủy lịch của một sub-slot cụ thể - Dùng API cancel giống như bệnh nhân
    const handleCancelSubSlotWithCancelAPI = async (subSlot) => {
        try {
            setProcessingSubSlot(subSlot.id);
            console.log('🔄 Starting cancel sub-slot process (Using Cancel API)...');
            console.log('Sub-slot data:', subSlot);
            console.log('Schedule ID to cancel:', schedule.id);
            
            // SỬ DỤNG CANCEL API GIỐNG NHU BỆNH NHÂN
            // API: DELETE /api/schedule/{scheduleId}/cancel?patientId={patientId}
            console.log('🌐 Calling CANCEL API (same as patient)...');
            
            // Vì Manager hủy lịch, không cần patientId cụ thể
            // Thử gọi API cancel mà không cần patientId hoặc dùng patientId = 0
            const response = await cancelBookingAPI(schedule.id, 0); // patientId = 0 cho Manager
            
            console.log('✅ CANCEL API Response received:');
            console.log('Status:', response.status);
            console.log('Response Data:', response.data);
            
            // Kiểm tra response thành công
            if (response.data || response.status === 200) {
                console.log('🎉 CANCEL API successful!');
                
                // Đóng modal sub-slots trước
                setShowSubSlots(false);
                
                // Đóng modal chính
                onHide();
                
                // Hiển thị thông báo thành công
                notification.success({
                    message: 'Thành công', 
                    description: 'Hủy lịch thành công ',
                    placement: 'topRight',
                    duration: 4
                });
                
                // Gọi callback để component cha refresh data từ server
                if (onRefreshData) {
                    console.log('🔄 Refreshing parent component data...');
                    try {
                        await onRefreshData();
                        console.log('🔄 Data refresh completed');
                    } catch (refreshError) {
                        console.error('❌ Data refresh failed:', refreshError);
                    }
                } else {
                    console.warn('⚠️ onRefreshData callback not available');
                }
            } else {
                console.error('❌ Unexpected cancel response:', response);
                throw new Error(`Unexpected cancel response: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ ERROR in handleCancelSubSlotWithCancelAPI:', error);
            
            if (error.response) {
                // Server responded with error status
                console.error('Server error:', error.response.status, error.response.data);
                
                let errorMessage = 'Không thể hủy lịch';
                if (error.response.status === 404) {
                    errorMessage = 'Không tìm thấy lịch hẹn';
                } else if (error.response.status === 400) {
                    errorMessage = 'Dữ liệu không hợp lệ';
                } else if (error.response.status === 500) {
                    errorMessage = 'Lỗi server nội bộ';
                } else {
                    errorMessage = `Lỗi HTTP ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
                }
                
                notification.error({
                    message: 'Lỗi',
                    description: errorMessage,
                    placement: 'topRight',
                    duration: 5
                });
            } else if (error.request) {
                // Request was made but no response received
                console.error('Network error:', error.request);
                
                notification.error({
                    message: 'Lỗi kết nối',
                    description: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
                    placement: 'topRight',
                    duration: 5
                });
            } else {
                // Something else happened
                console.error('Error:', error.message);
                
                notification.error({
                    message: 'Lỗi',
                    description: 'Có lỗi không mong muốn xảy ra',
                    placement: 'topRight',
                    duration: 5
                });
            }
        } finally {
            setProcessingSubSlot(null);
            console.log('🏁 handleCancelSubSlotWithCancelAPI process completed');
        }
    };

    // Hủy lịch của một sub-slot cụ thể - Dùng API update với status "Đã hủy" 
    const handleCancelSubSlot = async (subSlot) => {
        try {
            setProcessingSubSlot(subSlot.id);
            console.log('🔄 Starting cancel sub-slot process...');
            console.log('Sub-slot data:', subSlot);
            console.log('Schedule data:', schedule);
            console.log('🔍 DETAILED SCHEDULE ANALYSIS:');
            console.log('- schedule.id:', schedule.id, 'type:', typeof schedule.id);
            console.log('- schedule.doctorId:', schedule.doctorId, 'type:', typeof schedule.doctorId);
            console.log('- schedule.date:', schedule.date, 'type:', typeof schedule.date);
            console.log('- schedule.slot:', schedule.slot, 'type:', typeof schedule.slot);
            console.log('- schedule.roomCode:', schedule.roomCode, 'type:', typeof schedule.roomCode);
            console.log('- schedule.status:', schedule.status, 'type:', typeof schedule.status);
            console.log('- schedule.type:', schedule.type, 'type:', typeof schedule.type);
            console.log('- Full schedule object keys:', Object.keys(schedule));
            
            
            // Chuẩn bị dữ liệu cho UpdateScheduleRequest - theo đúng model BE
            // Giữ nguyên tất cả thông tin hiện tại, chỉ thay đổi status
            
            // Đảm bảo date format đúng (YYYY-MM-DD)
            let formattedDate = schedule.date;
            if (schedule.date && schedule.date.includes('/')) {
                // Nếu date format là DD/MM/YYYY, chuyển về YYYY-MM-DD
                const parts = schedule.date.split('/');
                if (parts.length === 3) {
                    formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                    console.log('🔄 Converted date from', schedule.date, 'to', formattedDate);
                }
            }
            
            const updateData = {
                doctorId: schedule.doctorId,  // long (required)
                date: formattedDate,          // LocalDate (required) - đảm bảo format YYYY-MM-DD 
                slot: schedule.slot,          // LocalTime (required)
                roomCode: schedule.roomCode,  // String (required)
                status: "Đã hủy"             // String (required) - chỉ thay đổi field này
                // Không có field "type" trong UpdateScheduleRequest model
            };
            
            console.log('🔄 STATUS CHANGE TRACKING:');
            console.log('- Current status in DB:', schedule.status);
            console.log('- Target status to update:', updateData.status);
            console.log('- Expected change: "' + schedule.status + '" → "' + updateData.status + '"');
            
            // Validation: Kiểm tra tất cả required fields
            const missingFields = [];
            if (!updateData.doctorId) missingFields.push('doctorId');
            if (!updateData.date) missingFields.push('date');
            if (!updateData.slot) missingFields.push('slot');
            if (!updateData.roomCode) missingFields.push('roomCode');
            if (!updateData.status) missingFields.push('status');
            
            if (missingFields.length > 0) {
                console.error('❌ Missing required fields:', missingFields);
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }
            
            console.log('📤 Final request data to be sent:');
            console.log('URL:', `/api/schedule/update/schedule-id/${schedule.id}`);
            console.log('Method: PUT');
            console.log('Headers: Content-Type: application/json');
            console.log('Body (formatted):', JSON.stringify(updateData, null, 2));
            console.log('Body (raw):', updateData);
            
            // Gọi API update dengan endpoint PUT /api/schedule/update/schedule-id/{id}
            console.log('🌐 Calling API update...');
            const response = await axios.put(`/api/schedule/update/schedule-id/${schedule.id}`, updateData);
            
            console.log('✅ API Response received:');
            console.log('Status:', response.status);
            console.log('Status Text:', response.statusText);
            console.log('Response Headers:', response.headers);
            console.log('Response Data:', response.data);
            console.log('Method used: Update API');
            
            // Kiểm tra response - Server trả về string: "SLOT UPDATED SUCCESSFULLY WITH ID: 24"
            let isSuccess = false;
            if (response.status === 200 || response.status === 201) {
                // Kiểm tra string response trực tiếp - CASE CHÍNH
                if (typeof response.data === 'string' && response.data.includes('UPDATED SUCCESSFULLY')) {
                    isSuccess = true;
                    console.log('🎉 SUCCESS! Server confirmed update:', response.data);
                } 
                // Backup: kiểm tra object format
                else if (response.data && response.data.message && response.data.message.includes('UPDATED SUCCESSFULLY')) {
                    isSuccess = true;
                    console.log('🎉 SUCCESS! Server message:', response.data.message);
                } 
                // Fallback: HTTP 200/201 = success (có thể server format khác)
                else {
                    console.log('⚠️ HTTP 200 but unknown response format - ASSUMING SUCCESS:', response.data);
                    isSuccess = true; // QUAN TRỌNG: Đảm bảo không bỏ sót
                }
            } else {
                console.error('❌ HTTP Error Status:', response.status);
                isSuccess = false;
            }
            
            console.log('🔍 Final isSuccess determination:', isSuccess);
            
            if (isSuccess) {
                console.log('🎉 API call reported success! Status update confirmed.');
                
                // Đóng modal sub-slots trước
                setShowSubSlots(false);
                
                // Đóng modal chính
                onHide();
                
                // Hiển thị thông báo thành công
                notification.success({
                    message: 'Thành công', 
                    description: 'Hủy lịch thành công - Trạng thái đã được cập nhật thành "Đã hủy"',
                    placement: 'topRight',
                    duration: 4
                });
                
                // Gọi callback để component cha refresh data từ server
                if (onRefreshData) {
                    console.log('🔄 Refreshing parent component data...');
                    try {
                        await onRefreshData();
                        console.log('🔄 Data refresh completed');
                    } catch (refreshError) {
                        console.error('❌ Data refresh failed:', refreshError);
                    }
                } else {
                    console.warn('⚠️ onRefreshData callback not available');
                }
            } else {
                console.error('❌ Unexpected response status:', response.status);
                throw new Error(`Unexpected response status: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ ERROR in handleCancelSubSlot:');
            console.error('Error object:', error);
            
            if (error.response) {
                // Server responded with error status
                console.error('📤 Request was made and server responded with error:');
                console.error('Status:', error.response.status);
                console.error('Status Text:', error.response.statusText);
                console.error('Response Headers:', error.response.headers);
                console.error('Response Data:', error.response.data);
                
                let errorMessage = 'Không thể hủy lịch';
                if (error.response.status === 404) {
                    errorMessage = 'Không tìm thấy lịch hẹn';
                } else if (error.response.status === 400) {
                    errorMessage = 'Dữ liệu không hợp lệ';
                } else if (error.response.status === 500) {
                    errorMessage = 'Lỗi server nội bộ';
                } else {
                    errorMessage = `Lỗi HTTP ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
                }
                
                notification.error({
                    message: 'Lỗi',
                    description: errorMessage,
                    placement: 'topRight',
                    duration: 5
                });
            } else if (error.request) {
                // Request was made but no response received
                console.error('📡 Request was made but no response received:');
                console.error('Request:', error.request);
                
                notification.error({
                    message: 'Lỗi kết nối',
                    description: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
                    placement: 'topRight',
                    duration: 5
                });
            } else {
                // Something else happened
                console.error('🐛 Error in setting up request:');
                console.error('Message:', error.message);
                
                notification.error({
                    message: 'Lỗi',
                    description: 'Có lỗi không mong muốn xảy ra',
                    placement: 'topRight',
                    duration: 5
                });
            }
        } finally {
            setProcessingSubSlot(null);
            console.log('🏁 handleCancelSubSlot process completed');
        }
    };

    // Xóa một sub-slot trống - sử dụng API xóa lịch đơn giản
    const handleDeleteSubSlot = async (subSlot) => {
        try {
            setProcessingSubSlot(subSlot.id);
            console.log('Deleting sub-slot:', subSlot);
            
            // Đơn giản: chỉ cần gọi API xóa lịch chính
            if (!schedule || !schedule.id) {
                console.error('Invalid schedule ID:', schedule);
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể xóa lịch: ID không hợp lệ',
                    placement: 'topRight',
                    duration: 3
                });
                return;
            }
            
            // Gọi API xóa lịch - đúng như logic gốc
            console.log('Deleting schedule:', schedule.id);
            const response = await deleteScheduleAPI(schedule.id);
            console.log('Delete response:', response);
            
            // Đóng cả hai modal
            setShowSubSlots(false);
            onHide();
            
            // Thông báo cho component cha
            onDelete(schedule.id);
            
            notification.success({
                message: 'Thành công',
                description: 'Đã xóa lịch làm việc',
                placement: 'topRight',
                duration: 3
            });
            
        } catch (error) {
            console.error('Error deleting sub-slot:', error);
            
            let errorMessage = 'Không thể xóa lịch';
            if (error.response) {
                if (error.response.status === 404) {
                    errorMessage = 'Không tìm thấy lịch hoặc lịch đã được xóa trước đó';
                } else if (error.response.status === 400) {
                    errorMessage = 'Không thể xóa lịch này';
                }
            }
            
            notification.error({
                message: 'Lỗi',
                description: errorMessage,
                placement: 'topRight',
                duration: 3
            });
        } finally {
            setProcessingSubSlot(null);
        }
    };

    const handleClose = () => {
        onHide();
        setConfirmDelete(false);
    };

    const formatDate = (dateString) => {
        return moment(dateString).format('DD/MM/YYYY');
    };

    // Hàm chuyển đổi thứ sang tiếng Việt
    const formatVietnameseDay = (date) => {
        const weekdays = [
            'Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 
            'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'
        ];
        const dayOfWeek = moment(date).day(); // 0 = Chủ nhật, 1 = Thứ hai, ...
        return weekdays[dayOfWeek];
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const slot = timeSlots.find(slot => slot.value === timeString);
        return slot ? slot.label : timeString.substring(0, 5);
    };
    
    // Lấy tên ca làm việc
    const getShiftName = (shiftType) => {
        if (!shiftType) return null;
        return shiftType === 'morning' ? 'Ca sáng (08:00 - 11:00)' : 'Ca chiều (13:00 - 16:00)';
    };

    const handleUpdateSchedule = async () => {
        try {
            setIsLoading(true);
            const updatedScheduleData = {
                date: selectedSchedule.date,
                slot: selectedSchedule.slot,
                roomCode: selectedSchedule.roomCode,
                status: selectedSchedule.status,
                doctorId: selectedSchedule.doctorId,
            };

            console.log('Bắt đầu cập nhật lịch:', selectedSchedule.id);
            const updatedSchedules = await updateScheduleAPI(selectedSchedule.id, updatedScheduleData);
            
            // Cập nhật state với danh sách lịch mới
            if (updatedSchedules?.data) {
                setSchedules(updatedSchedules.data);
                handleClose();
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật lịch:', error);
            notification.error({
                message: 'Lỗi',
                description: 'Không thể cập nhật lịch. Vui lòng thử lại!',
                placement: 'topRight',
                duration: 3
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!schedule) {
        return null;
    }

    return (
        <>
            {/* Modal chính - Ẩn khi modal sub-slots đang hiển thị */}
            <Modal 
                show={show && !showSubSlots} 
                onHide={handleClose} 
                centered 
                size="lg" 
                className="schedule-detail-modal"
                backdrop="static"
            >
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>Chi tiết lịch làm việc</Modal.Title>
                </Modal.Header>
            <Modal.Body>
                {confirmDelete ? (
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#fff2f0',
                        border: '1px solid #ffccc7',
                        borderRadius: '6px',
                        marginBottom: '16px'
                    }}>
                        <p style={{ marginBottom: '8px', fontWeight: 'bold', color: '#cf1322' }}>Xác nhận xóa lịch làm việc</p>
                        <p style={{ marginBottom: '8px', color: '#262626' }}>Bạn có chắc chắn muốn xóa lịch làm việc của bác sĩ {formData.doctorName} vào ngày {formatDate(formData.date)} lúc {formatTime(formData.slot)}?</p>
                        <p style={{ marginBottom: '0', color: '#8c8c8c' }}>Thao tác này không thể hoàn tác và sẽ xóa dữ liệu khỏi hệ thống.</p>
                    </div>
                ) : (
                    <Form onSubmit={handleSubmit}>
                        {/* Thông tin cơ bản */}
                        <div className="schedule-info-section mb-4 p-3 border rounded bg-light">
                            <h5 className="mb-3">Thông tin chung</h5>
                            
                            <Row className="mb-3">
                                <Col md={6} className="d-flex align-items-center mb-2">
                                    <BsPerson className="text-primary me-2" size={20} />
                                    <div>
                                        <div className="text-muted small">Bác sĩ</div>
                                        <strong>{formData.doctorName}</strong>
                                    </div>
                                </Col>
                                
                                <Col md={6} className="d-flex align-items-center mb-2">
                                    <BsDoorOpen className="text-success me-2" size={20} />
                                    <div>
                                        <div className="text-muted small">Phòng</div>
                                        <strong>Phòng {formData.roomCode}</strong>
                                    </div>
                                </Col>
                            </Row>
                            
                            <Row>
                                <Col md={6} className="d-flex align-items-center">
                                    <BsCalendarWeek className="text-info me-2" size={20} />
                                    <div>
                                        <div className="text-muted small">Ngày</div>
                                        <div className="schedule-date-value">
                                            <strong>{formatDate(formData.date)}</strong> 
                                            <span className="ms-2 text-muted small">
                                                ({formatVietnameseDay(formData.date)})
                                            </span>
                                        </div>
                                    </div>
                                </Col>
                                
                                <Col md={6} className="d-flex align-items-center">
                                    <BsClock className="text-warning me-2" size={20} />
                                    <div>
                                        <div className="text-muted small">Khung giờ</div>
                                        <strong>{formatTime(formData.slot)}</strong>
                                    </div>
                                </Col>
                            </Row>
                            
                            {/* Hiển thị thông tin ca làm việc */}
                            <Row className="mt-3">
                                <Col md={12} className="d-flex align-items-center">
                                    <BsBriefcase className="text-primary me-2" size={20} />
                                    <div>
                                        <div className="text-muted small">Ca làm việc</div>
                                        {formData.shiftType ? (
                                            <Badge 
                                                bg={formData.shiftType === 'morning' ? 'info' : 'warning'}
                                                className="p-2"
                                            >
                                                {getShiftName(formData.shiftType)}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted">Không thuộc ca nào</span>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                            
                            {/* Hiển thị thông tin số lượng bệnh nhân */}
                            <Row className="mt-3">
                                <Col md={6} className="d-flex align-items-center">
                                    <BsPersonPlus className="text-success me-2" size={20} />
                                    <div>
                                        <div className="text-muted small">Số bệnh nhân</div>
                                        <Badge 
                                            bg={formData.currentPatients >= formData.maxPatients ? 'danger' : 
                                               formData.currentPatients > 0 ? 'warning' : 'success'}
                                            className="p-2"
                                        >
                                            {formData.currentPatients} / {formData.maxPatients}
                                        </Badge>
                                    </div>
                                </Col>
                                
                                <Col md={6} className="d-flex align-items-center">
                                    <BsList className="text-info me-2" size={20} />
                                    <div>
                                        <div className="text-muted small">Quản lý</div>
                                        {formData.currentPatients > 0 ? (
                                            <Badge bg="info" className="p-2">
                                                Có thể quản lý từng slot
                                            </Badge>
                                        ) : (
                                            <Badge bg="success" className="p-2">
                                                Có thể xóa trực tiếp
                                            </Badge>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        
                        {/* Thông tin cập nhật */}
                        <div className="update-section mb-3 p-3 border rounded">
                            <h5 className="mb-3">Cập nhật thông tin</h5>
                            
                            {/* Thông tin ca làm việc */}
                            <Form.Group className="mb-3">
                                <Form.Label>Ca làm việc</Form.Label>
                                <Form.Select
                                    name="shiftType"
                                    value={formData.shiftType || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">Không thuộc ca nào</option>
                                    <option value="morning">Ca sáng (08:00 - 11:00)</option>
                                    <option value="afternoon">Ca chiều (13:00 - 16:00)</option>
                                </Form.Select>
                                <Form.Text className="text-muted">
                                    Đánh dấu lịch này thuộc ca làm việc nào
                                </Form.Text>
                            </Form.Group>
                            
                            {/* Khung giờ cụ thể */}
                            <Form.Group className="mb-3">
                                <Form.Label>Khung giờ cụ thể</Form.Label>
                                <Form.Select
                                    name="slot"
                                    value={formData.slot}
                                    onChange={handleChange}
                                >
                                    {timeSlots.map(slot => (
                                        <option key={slot.value} value={slot.value}>
                                            {slot.label}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Text className="text-muted">
                                    Thiết lập thời gian làm việc cụ thể cho bác sĩ
                                </Form.Text>
                            </Form.Group>
                            
                            {/* Thêm phần cập nhật phòng làm việc */}
                            <Form.Group className="mb-3">
                                <Form.Label>Phòng làm việc</Form.Label>
                                <div className="d-flex align-items-center">
                                    <BsDoorOpen className="text-success me-2" size={20} />
                                    <Form.Control
                                        type="text"
                                        name="roomCode"
                                        value={formData.roomCode}
                                        onChange={handleChange}
                                        placeholder="Nhập số phòng (VD: 101)"
                                        required
                                    />
                                </div>
                            </Form.Group>
                        </div>
                        
                        {/* Thông tin hệ thống */}
                        <div className="system-info p-2 border-top mt-3">
                            <small className="d-block text-muted mb-1">ID lịch: {formData.id}</small>
                            <small className="d-block text-muted">Cập nhật gần nhất: {moment().format('DD/MM/YYYY HH:mm')}</small>
                        </div>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer>
                <div className="button-container">
                    {!confirmDelete ? (
                        <Button 
                            variant="outline-danger" 
                            onClick={showDeleteConfirmation} 
                            disabled={deleting}
                            className="btn-action"
                        >
                            {formData.currentPatients > 0 ? (
                                <>
                                    <BsList className="me-1" />
                                    Quản lý slot
                                </>
                            ) : (
                                'Xóa lịch'
                            )}
                        </Button>
                    ) : (
                        <>
                            <Button 
                                variant="secondary" 
                                onClick={cancelDelete} 
                                className="btn-action"
                                disabled={deleting}
                            >
                                Hủy xóa
                            </Button>
                            <Button 
                                variant="danger" 
                                onClick={handleDelete} 
                                disabled={deleting}
                                className="btn-action"
                            >
                                {deleting ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-1" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Xác nhận xóa'
                                )}
                            </Button>
                        </>
                    )}
                    
                    <div className="action-buttons">
                        <Button 
                            variant="outline-secondary" 
                            onClick={handleClose} 
                            className="btn-action"
                        >
                            Đóng
                        </Button>
                        {!confirmDelete && (
                            <Button 
                                variant="outline-primary" 
                                onClick={handleSubmit} 
                                disabled={loading}
                                className="btn-action"
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-1" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Cập nhật'
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </Modal.Footer>
        </Modal>

        {/* Modal quản lý sub-slots - Hiển thị độc lập */}
        <Modal 
            show={showSubSlots} 
            onHide={closeSubSlotsModal} 
            centered 
            size="lg" 
            className="sub-slots-modal"
            backdrop="static"
            style={{ zIndex: 1060 }}
        >
            <Modal.Header closeButton className="bg-light">
                <Modal.Title>
                    <BsList className="me-2" />
                    Quản lý từng slot bệnh nhân
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ position: 'relative' }}>
                <div className="mb-3">
                    <h6>Lịch: {formData.doctorName} - {formatDate(formData.date)} - {formatTime(formData.slot)}</h6>
                    <p className="text-muted small">
                        Slot này có thể chứa tối đa {formData.maxPatients} bệnh nhân. 
                        Hiện tại có {formData.currentPatients} bệnh nhân đã đặt lịch.
                    </p>
                </div>

                {/* Confirmation hủy sub-slot - Thiết kế mới đơn giản và đẹp */}
                {showCancelConfirm && selectedSubSlotToCancel && (
                    <div className="confirmation-overlay">
                        <div className="confirmation-card">
                            <div className="confirmation-header">
                                <div className="confirmation-icon">
                                    <BsPersonDash size={24} />
                                </div>
                                <h5 className="confirmation-title">Xác nhận hủy lịch</h5>
                            </div>
                            
                            <div className="confirmation-body">
                                <p className="confirmation-question">
                                    Bạn có chắc chắn muốn hủy lịch của
                                </p>
                                <div className="patient-info">
                                    <strong>{selectedSubSlotToCancel.patientName}</strong>
                                    <span className="slot-badge">Slot {selectedSubSlotToCancel.slotNumber}</span>
                                </div>
                                <p className="confirmation-warning">
                                    Thao tác này không thể hoàn tác
                                </p>
                            </div>
                            
                            <div className="confirmation-actions">
                                <button 
                                    className="btn-cancel-action"
                                    onClick={cancelSubSlotConfirmation}
                                    disabled={processingSubSlot !== null}
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    className="btn-confirm-action"
                                    onClick={confirmCancelSubSlot}
                                    disabled={processingSubSlot !== null}
                                >
                                    {processingSubSlot === selectedSubSlotToCancel?.id ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-1" />
                                            Đang hủy...
                                        </>
                                    ) : (
                                        'Xác nhận hủy'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {loadingSubSlots ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" />
                        <p className="mt-2">Đang tải danh sách...</p>
                    </div>
                ) : (
                    <div className="sub-slots-list">
                        {subSlots.map((subSlot, index) => (
                            <div 
                                key={subSlot.id} 
                                className={`d-flex align-items-center justify-content-between p-3 mb-2 border rounded ${
                                    subSlot.status === 'Đã hủy' ? 'border-secondary bg-light' :
                                    subSlot.hasPatient ? 'border-warning bg-light' : 'border-success'
                                }`}
                            >
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <Badge 
                                            bg={
                                                subSlot.status === 'Đã hủy' ? 'secondary' :
                                                subSlot.hasPatient ? 'warning' : 'success'
                                            } 
                                            className="p-2"
                                        >
                                            Slot {subSlot.slotNumber}
                                        </Badge>
                                    </div>
                                    <div>
                                        <div className="fw-bold">
                                            {subSlot.hasPatient ? subSlot.patientName : ' Slot trống'}
                                        </div>
                                        <small className="text-muted">
                                            Trạng thái: <span className={
                                                subSlot.status === 'Đã hủy' ? 'text-secondary fw-bold' :
                                                subSlot.status === 'Đang hoạt động' ? 'text-warning' : 'text-success'
                                            }>
                                                {subSlot.status}
                                            </span>
                                        </small>
                                    </div>
                                </div>
                                
                                <div className="d-flex gap-2">
                                    {subSlot.canCancel && (
                                        <Button
                                            variant="outline-warning"
                                            size="sm"
                                            onClick={() => showCancelSubSlotConfirmation(subSlot)}
                                            disabled={processingSubSlot === subSlot.id || showCancelConfirm}
                                        >
                                            <BsPersonDash className="me-1" />
                                            Hủy lịch
                                        </Button>
                                    )}
                                    {subSlot.hasPatient && !subSlot.canCancel && subSlot.status !== 'Đã hủy' && (
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            disabled
                                            title="Không thể hủy lịch trong quá khứ"
                                        >
                                            <BsPersonDash className="me-1" />
                                            Đã quá hạn
                                        </Button>
                                    )}
                                    {subSlot.canDelete && (
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeleteSubSlot(subSlot)}
                                            disabled={processingSubSlot === subSlot.id}
                                        >
                                            {processingSubSlot === subSlot.id ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-1" />
                                                    Đang xóa...
                                                </>
                                            ) : (
                                                'Xóa slot'
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button 
                    variant="secondary" 
                    onClick={() => setShowSubSlots(false)}
                    disabled={processingSubSlot !== null || showCancelConfirm}
                >
                    {processingSubSlot !== null ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Đang xử lý...
                        </>
                    ) : showCancelConfirm ? (
                        'Vui lòng hoàn thành xác nhận'
                    ) : (
                        'Đóng'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    </>
    );
};

export default ScheduleDetail;
