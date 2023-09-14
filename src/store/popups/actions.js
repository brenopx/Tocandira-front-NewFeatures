/** This module contains the implementation
 * of the actions accepted by auth redux
 * 
 * Copyright (c) 2017 Aimirim STI.
*/

// Local Imports
import * as actionTypes from './actionTypes';

// #######################################

/** Redux action to */
export const openDataSourcePopup=(status) => ({type:actionTypes.OPEN_DATASOURCE, open:status});

/** Redux action to  */
export const openDataPointPopup=(status) => ({type:actionTypes.OPEN_DATAPOINT, open:status});

/** Redux action to  */
export const openCollectorPopup=(status) => ({type:actionTypes.OPEN_COLLECTOR, open:status});

/** Redux action to  */
export const openVerifyPopup=(status) => ({type:actionTypes.OPEN_VERIFY, open:status});

/** Redux action to  */
export const openUploadPopup=(status) => ({type:actionTypes.OPEN_UPLOAD, open:status});

/** Redux action to  */
export const emitAlert = (text,type,options={}) => {
    const key = new Date().getTime() + Math.random();
    const payload = { message:text, key: key, options:{ variant: type, ...options }}
    return ({type: actionTypes.ADD_ALERT,notification:payload});
};

/** Redux action to  */
export const emitNetworkErrorAlert = (options={}) => emitAlert('Unable to Connect to Server','error',options);

/** Redux action to  */
export const removeSnackbar = key => ({type: actionTypes.REMOVE_ALERT,key,});
