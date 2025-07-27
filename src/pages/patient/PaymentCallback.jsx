import {
    useEffect
} from 'react';
import {
    Result,
    Button
} from 'antd';
import {
    useLocation,
    useNavigate
} from 'react-router-dom';
import {
    handlePaymentCallbackAPI
} from '../../services/appointment.service';
import {
    createHealthRecordAPI
} from '../../services/health-record.service';

const PaymentCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {

        handleCallback();
    }, [location]);

    const params = new URLSearchParams(location.search);
    const queryParams = {};
    params.forEach((value, key) => {
        queryParams[key] = value;
    });

    const handleCallback = async () => {
        try {
            const response = await handlePaymentCallbackAPI(queryParams);
            if (queryParams['vnp_ResponseCode'] === '00') {
                const healthResponse = await createHealthRecordAPI(queryParams['vnp_TxnRef'])
            }
        } catch (error) {
            console.error('Payment failed:', error.message);
        }
    };

    return (
        <Result style={{ minHeight: '1000px' }}
            status={new URLSearchParams(location.search).get('vnp_ResponseCode') === '00' ? 'success' : 'error'}
            title={new URLSearchParams(location.search).get('vnp_ResponseCode') === '00'
                ? 'Thanh toán thành công'
                : 'Thanh toán thất bại'}
            subTitle="Vui lòng kiểm tra lịch hẹn của bạn."
            extra={[
                <Button type="primary" key="home" onClick={() => navigate('/')}>
                    Về trang chủ
                </Button>,
            ]}
        />
    );
};
export default PaymentCallback;