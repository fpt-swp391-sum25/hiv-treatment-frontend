import { useRouteError } from "react-router-dom";
import { Button, Result } from 'antd';

const NotFound = () => {
    const error = useRouteError();
    return (

        <Result
            status="404"
            title="Oops! Something went wrong."
            subTitle={error.statusText || error.message}
        />

    );
}

export default NotFound