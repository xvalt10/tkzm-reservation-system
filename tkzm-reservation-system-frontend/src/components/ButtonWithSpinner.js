import Loader from "react-loader-spinner";
import {useEffect} from "react";

const ButtonWithSpinner = ({showSpinner, text, onClickFunction}) => {

    const onClickAction = (e) => {
        e.preventDefault();
        onClickFunction(e);
    }

    useEffect(() => {


    }, [showSpinner]);

    return (
        <button className="button is-rounded is-info" onClick={(e) => onClickAction(e)}>
            <div style={{display: 'flex', alignItems: 'center'}}>
                {showSpinner && <Loader
                    type="TailSpin"
                    color="#00BFFF"
                    height={'30px'}
                    width={'30px'}
                />}
                <div style={{marginLeft: '10px'}}>{text}</div>
            </div>
        </button>
    );
}

export default ButtonWithSpinner;