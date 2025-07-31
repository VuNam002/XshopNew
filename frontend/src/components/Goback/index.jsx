import { useNavigate } from "react-router-dom";
function Goback() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(-1);
    }

    return(
        <>
            <button className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700" onClick={handleClick}>Trở lại</button>
        </>
    )
}
export default Goback;