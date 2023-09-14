/** This module holds the view of the React
 * component `DataSourcePopup`
 * 
 * Copyright (c) 2017 Aimirim STI.
 * 
 * Dependencies are:
 * - react 
*/

// Imports from modules;
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {Collapse, Stack, TextField } from '@mui/material'

// Local Imports
import FormPopup from  './FormPopup'
import {ImplementedProtocols} from '../Protocols/Protocols'
import BaseProtocol from '../Protocols/BaseProtocol';
import SimpleSelect from '../SimpleSelect/SimpleSelect';
import CustomAlert from '../CustomAlert/CustomAlert';
import * as datasourceActions from '../../store/datasource/actions'
//import './DataSourcePopup.css';

// #######################################

/** Description
* @property `props.`:
* @method `props.`: */
class DataSourcePopup extends React.PureComponent {
    
    /** Defines the component property types */
    static propTypes = {
        is_new: PropTypes.bool,
        selected_row: PropTypes.object,
        open: PropTypes.bool,
        onClose: PropTypes.func,
        onNewSave: PropTypes.func,
        onEditSave: PropTypes.func,
        global: PropTypes.object,
        datasource: PropTypes.object,
    };
    /** Defines the component state variables */
    state = {
        protocol_selected:"",
        info_ds:{},
        validation:{
            ip:true,
            name:true,
            unique:true,
        }
    };
    
    /** Description.
    * @param ``: 
    * @returns */
    handleClearErrors=() => {
        const newState = {...this.state};
        newState.validation = {...this.state.validation};
        newState.validation.ip = true;
        newState.validation.name = true;
        newState.validation.unique = true;
        this.setState(newState);
    }

    /** Description.
    * @param ``: 
    * @returns */
    handleErrorMessage=() => {
        let msg = "";
        if (!this.state.validation.unique) {
            msg = "Duplicated Name "
        } else {
            msg = "Invalid "
            if (!this.state.validation.ip){ msg += "IP " }
            if (!this.state.validation.name){
                if (!this.state.validation.ip){ msg += "and " }
                msg += "Name " 
            }
        }
        msg += "detected."
        return(msg)
    }

    /** Description.
    * @param ``: 
    * @returns */
    handleSaveClick=() => {
        const prot_name = this.state.protocol_selected;
        const info2save = this.state.info_ds[prot_name];
        info2save.collector_id = this.props.collector.selected.id;

        const ip_verify = BaseProtocol.isValidIp(info2save.plc_ip);
        const name_verify = info2save.name!=="";
        const name_equal = this.props.datasource.ds_content.find(ele=>ele.name===info2save.name)

        const newState = {...this.state};
        newState.validation = {...this.state.validation};
        newState.validation.ip = ip_verify;
        newState.validation.name = name_verify;
        newState.validation.unique = !name_equal;
        this.setState(newState);

        if (this.props.is_new) {
            if (ip_verify && name_verify && !name_equal) {
                this.props.onNewSave(this.props.global.backend_instance, info2save);
                this.handleCancelClick();
            }
        } else {
            if (ip_verify && name_verify){
                this.props.onEditSave(this.props.global.backend_instance, info2save);
                this.handleCancelClick();
            }
        }
    }

    /** Description.
    * @param ``: 
    * @returns */
    handleCancelClick=() => {
        this.props.onClose()
    }

    /** Description.
    * @param ``: 
    * @returns */
    handleInfoChange=(prot_name,info) => {
        const newState = {...this.state};
        newState.info_ds = {...this.state.info_ds};
        newState.info_ds[prot_name] = info;
        this.setState(newState);
    }

    /** Description.
    * @param ``: 
    * @returns */
    handleProtocolChange=(prot_name) => {
        const newState = {...this.state};
        newState.protocol_selected = prot_name;
        this.setState(newState);
    }
    
    /** Description.
    * @param ``: 
    * @returns */
    handleFixProtocol=() => {
        const newState = {...this.state};
        const row = this.props.datasource.ds_content.find(row=>row.name===this.props.selected_row.name);
        if (row) {
            const prot_name = row.protocol.name;
            newState.protocol_selected = prot_name;
            newState.info_ds = {...this.state.info_ds};
            newState.info_ds[prot_name] = row;
        }
        this.setState(newState);
    }

    /** Description.
    * @param ``: 
    * @returns */
    handleSelectChange=(event) => {
        const newState = {...this.state};
        const prot_name = event.target.value;
        const prot_defaults = this.props.datasource.ds_defaults[prot_name];
        const prot_class = ImplementedProtocols.find(ele=>ele.name===prot_name).class;
        const info = prot_class.parseDataSourceDefault2Values(prot_defaults);

        newState.protocol_selected = prot_name;
        newState.info_ds = {...this.state.info_ds};
        newState.info_ds[prot_name] = info;

        this.setState(newState);
    }

    /** Description.
    * @param ``: 
    * @returns */
    handleDefaultsChange=(status) => {
        const newState = {...this.state};
        newState.need_defaults_update = status;
        this.setState(newState);
    }

    /** Description.
    * @param ``: 
    * @returns */
    handleAnimations=(check)=>{
        let delay_value;
        let timeout_value;
        if (check) {
            delay_value='400ms';
            timeout_value=700;
        } else {
            delay_value='0ms';
            timeout_value=300;
        }
        const props = {
            delay:{transitionDelay: delay_value},
            timeout:timeout_value
        };

        return(props);
    }

    /** Description.
    * @param ``: 
    * @returns */
    buildContents=(content, index) => {
        const check = this.state.protocol_selected === content.name;
        const prop = this.handleAnimations(check);
        let element = <Collapse timeout={prop.timeout} key={index} in={check} style={prop.delay} unmountOnExit>
            {content.fields}
        </Collapse>
        return(element);
    }

    /** Description.
    * @param ``: 
    * @returns */
    buildSpecificProtocolFields=(ele) => {
        const defaults = this.props.datasource.ds_defaults[ele.name]
        const values = this.state.info_ds[ele.name]
        const events = ele.class.getDataSourceEvents(this,ele.name)
        if(!this.props.is_new) {
            // This hack prevents the edit of Name field when editing
            events.onNameChange = null;
        }
        let prot_form = null;
        if (defaults && values) {
            prot_form = ele.class.dataSourceFields(events,values,defaults)
        }
        return({name:ele.name, fields:prot_form})
    }

    /** Defines the component visualization.
    * @returns JSX syntax element */ 
    render(){
        const content_array = ImplementedProtocols.map(this.buildSpecificProtocolFields)
        let valid_data = null;
        let select_component = null;
        if (this.props.is_new){
            valid_data = this.state.validation.ip && this.state.validation.name && this.state.validation.unique;
            select_component = <SimpleSelect
                label={"Protocol"}
                default_value={this.props.datasource.protocol_default}
                list={this.props.datasource.protocol_avail}
                value={this.state.protocol_selected}
                onChange={this.handleSelectChange}/>
        } else {
            valid_data = this.state.validation.ip && this.state.validation.name;
            select_component = <TextField variant="outlined" label="Protocol" type='text' disabled
                fullWidth value={this.state.protocol_selected}/>
        }

        const err_msg = this.handleErrorMessage();
        const alert = <CustomAlert type='error' elevate
            reset={this.handleClearErrors} msg={err_msg}/>

        const jsx_component = (
            <FormPopup
                open={this.props.open}
                title="New DataSource"
                nameOk="SAVE" nameCancel="CANCEL"
                onOkClick={this.handleSaveClick}
                onCancelClick={this.handleCancelClick}>
                <Stack direction="column" spacing='1rem' flexGrow='1' alignItems="stretch">
                    {select_component}
                    {content_array.map(this.buildContents)}
                    <Collapse in={!valid_data}>{alert}</Collapse>
                </Stack>
            </FormPopup>
        );
        return(jsx_component);
    }

    componentDidMount=() => {
        if(!this.props.is_new){
            this.handleFixProtocol()
        }
    }
    
}

/** Map the Redux state to some component props */
const reduxStateToProps = (state) =>({
    global: state.global,
    datasource: state.datasource,
    collector: state.collector
});

/** Map the Redux actions dispatch to some component props */
const reduxDispatchToProps = (dispatch) =>({
    onNewSave:(api,info)=>dispatch(datasourceActions.pushData(api,info)),
    onEditSave:(api,info)=>dispatch(datasourceActions.putData(api,info)),
});

// Make this component visible on import
export default connect(reduxStateToProps,reduxDispatchToProps)(DataSourcePopup);