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

// Local Imports
import * as datapointActions from '../../store/datapoint/actions'
import EditTable from '../DataTable/EditTable'
import DialogFullScreen from './DialogFullScreen'
//import './DataSourcePopup.css';

// #######################################

/** Description
* @property `props.`:
* @method `props.`: */
class DataSourcePopup extends React.PureComponent {
    
    /** Defines the component property types */
    static propTypes = {
        OpenDialog: PropTypes.bool,
    };
    /** Defines the component state variables */
    state = {
        dp_content:[],
        edit_dp_content:[],
    };
    
    handleDsContent=() => {
        let list_dp = this.props.datapoint.dp_content.filter(this.filterData)
        const newState = {...this.state};
        newState.dp_content = list_dp;
        this.setState(newState);
    }

    processRowUpdate=(newRow) =>{
        let new_dp_content = []
        let edit_dp_content = this.state.edit_dp_content
        let list_dp = this.props.datapoint.dp_content.filter(this.filterData)
        list_dp.forEach((row) => {
            if(row.name === newRow.name){
                let isnew = true
                edit_dp_content = edit_dp_content.map((item)=>{
                    if(item.name === newRow.name){
                        isnew = false
                        return (newRow)
                    } else{
                        return (item)
                    }
                })
                if (isnew){
                    edit_dp_content.push(newRow)
                }
                new_dp_content.push(newRow)
            } else {
                new_dp_content.push(row)
            }
        })
        const newState = {...this.state};
        newState.dp_content = new_dp_content;
        newState.edit_dp_content = edit_dp_content;
        this.setState(newState);
    }

    handleClear=() =>{
        const newState = {...this.state};
        newState.dp_content = [];
        newState.edit_dp_content = [];
        this.setState(newState);
    }

    handleOkClickDialog=() => {
        this.props.onHandleStateEditDp(false)
        console.log("valor de edit_dp_content", this.state.edit_dp_content)
        this.handleClear();
    }

    handleCancelClickDialog=() => {
        this.props.onHandleStateEditDp(false);
        this.handleClear();
    }

    /** Description.
    * @param ``: 
    * @returns */
    filterData=(row) => {
        const ds_name = row.datasource_name
        const ds = this.props.datasource.ds_content.filter(row=>row.name===ds_name)[0]
        if (ds) {
            return(row.active && ds.collector_id===this.props.collector.selected.id)
        } else {
            return(false)
        }
    }

    /** Defines the component visualization.
    * @returns JSX syntax element */ 
    render(){
        const header = [
            {field: "name", headerName:"Name",editable: false, flex:1},
            {field: "description", headerName:"Description",editable: true, flex:1},
            {field: "num_type", headerName:"Num Type",editable: true, flex:1},
            {field: "datasource_name", headerName:"Data Source",editable: true, flex:1},
            {field: "access", headerName:"Access", editable: true, flex:2,valueGetter: (params) => params.row.access.name},
        ]

        const jsx_component = (
                <DialogFullScreen
                    open={this.props.OpenDialog}
                    title={"Data Point"}
                    onOkClick={this.handleOkClickDialog}
                    onCancelClick={this.handleCancelClickDialog}
                >
                    <EditTable 
                        headers={header}
                        content_rows={this.state.dp_content}
                        processRowUpdate={this.processRowUpdate}
                    />
                </DialogFullScreen>
        );
        return(jsx_component);
    }

    componentDidMount=() => {
        this.handleDsContent();
    }
}

/** Map the Redux state to some component props */
const reduxStateToProps = (state) =>({
    global: state.global,
    popups: state.popups,
    datapoint: state.datapoint,
    datasource: state.datasource,
    collector: state.collector,
});

/** Map the Redux actions dispatch to some component props */
const reduxDispatchToProps = (dispatch) =>({
    onHandleStateEditDp:(state)=>dispatch(datapointActions.handleStateEditDp(state)),
});

// Make this component visible on import
export default connect(reduxStateToProps,reduxDispatchToProps)(DataSourcePopup);