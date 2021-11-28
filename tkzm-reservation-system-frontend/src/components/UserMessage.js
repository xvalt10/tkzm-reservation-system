import React, {Component} from 'react';
import PropTypes from 'prop-types';

const UserMessage = ({message, color}) =>
{
        return (
            <div className={'user-message'} style={{background:color}}>
                {message}
            </div>
        );

}

UserMessage.propTypes = {};

export default UserMessage;