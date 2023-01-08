import React from 'react';
import { WithTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';

import { IReduxState } from '../../../../app/types';
import { translate } from '../../../../base/i18n/functions';
import Icon from '../../../../base/icons/components/Icon';
import { IconCheck, IconExclamationTriangle } from '../../../../base/icons/svg';
import { connect } from '../../../../base/redux/functions';
import {
    getDeviceStatusText,
    getDeviceStatusType
} from '../../../functions';

export interface IProps extends WithTranslation {

    /**
     * The text to be displayed in relation to the status of the audio/video devices.
     */
    deviceStatusText?: string;

    /**
     * The type of status for current devices, controlling the background color of the text.
     * Can be `ok` or `warning`.
     */
    deviceStatusType?: string;
}

const useStyles = makeStyles()(theme => {
    return {
        deviceStatus: {
            alignItems: 'center',
            color: '#fff',
            display: 'flex',
            fontSize: '14px',
            lineHeight: '20px',
            padding: '6px',
            textAlign: 'center',

            '& span': {
                marginLeft: theme.spacing(3)
            },

            '&.device-status-error': {
                alignItems: 'flex-start',
                backgroundColor: theme.palette.warning01,
                borderRadius: '6px',
                color: theme.palette.uiBackground,
                padding: '12px 16px',
                textAlign: 'left'
            },
            '& .device-icon': {
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'inline-block',
                height: '16px',
                width: '16px'
            },
            '& .device-icon--ok svg path': {
                fill: '#189B55'
            }
        }
    };
});

const iconMap = {
    warning: {
        src: IconExclamationTriangle,
        className: 'device-icon--warning'
    },
    ok: {
        src: IconCheck,
        className: 'device-icon--ok'
    }
};

/**
 * Strip showing the current status of the devices.
 * User is informed if there are missing or malfunctioning devices.
 *
 * @returns {ReactElement}
 */
function DeviceStatus({ deviceStatusType, deviceStatusText, t }: IProps) {
    const { classes, cx } = useStyles();
    const { src, className } = iconMap[deviceStatusType as keyof typeof iconMap];
    const hasError = deviceStatusType === 'warning';
    const containerClassName = cx(classes.deviceStatus, { 'device-status-error': hasError });

    return (
        <div
            className = { containerClassName }
            role = 'alert'
            tabIndex = { -1 }>
            <Icon
                className = { `device-icon ${className}` }
                size = { 16 }
                src = { src } />
            <span role = 'heading'>
                {hasError ? t('prejoin.errorNoPermissions') : t(deviceStatusText ?? '')}
            </span>
        </div>
    );
}

/**
 * Maps (parts of) the redux state to the React {@code Component} props.
 *
 * @param {Object} state - The redux state.
 * @returns {{ deviceStatusText: string, deviceStatusText: string }}
 */
function mapStateToProps(state: IReduxState) {
    return {
        deviceStatusText: getDeviceStatusText(state),
        deviceStatusType: getDeviceStatusType(state)
    };
}

export default translate(connect(mapStateToProps)(DeviceStatus));
