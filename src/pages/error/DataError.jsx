import { 
    useRouteError 
} from "react-router-dom"
import { 
    Result 
} from 'antd'

const DataErrors = () => {
    const error = useRouteError()
    return (
        <Result
            status="500"
            title="Oops! Something went wrong."
            subTitle={error.statusText || error.message}
        />

    )
}
export default DataErrors