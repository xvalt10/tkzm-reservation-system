export const BACKEND_BASE_URL=process.env.REACT_APP_API_URL
export const RESERVATION_TYPES = {
    'LONGTERM':'longterm',
    'ONETIME':'onetime'
}

export const RESERVATION_PARAMS = {
    'numberOfCours': 5,
    'startHour': 6,
    'endHour': 22
}

export const MODAL_CUSTOM_STYLES = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 31
    },
}


