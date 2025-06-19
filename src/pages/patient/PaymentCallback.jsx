import React, { useEffect } from 'react';
import { Result, Button } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { handlePaymentCallbackAPI } from '../../services/api.service';


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
            await handlePaymentCallbackAPI(queryParams);
            console.log('Payment success');
            console.log(queryParams)
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