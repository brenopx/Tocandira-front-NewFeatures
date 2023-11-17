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
import * as datasourceActions from '../../store/datasource/actions'
import EditTable from '../../component/DataTable/EditTable'
import DialogFullScreen from '../../component/Popups/DialogFullScreen'
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import {
    GridActionsCellItem,
} from '@mui/x-data-grid';
import { Box } from '@mui/material';
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
        ds_content:[],
        edit_ds_content:[],
    };
    
    handleDsContent=() => {
        let list_ds = this.props.datasource.ds_content.filter(this.filterData)
        list_ds.forEach((row) => {
            row['is_excluding'] = false
        })
        const newState = {...this.state};
        newState.ds_content = list_ds;
        this.setState(newState);
    }

    processRowUpdate=(newRow) =>{
        let new_ds_content = []
        let edit_ds_content = this.state.edit_ds_content
        let list_ds = this.state.ds_content
        list_ds.forEach((row) => {
            if(row.name === newRow.name){
                newRow['protocol'] = row['protocol']
                let isnew = true
                edit_ds_content = edit_ds_content.map((item)=>{
                    if(item.name === newRow.name){
                        isnew = false
                        return (newRow)
                    } else{
                        return (item)
                    }
                })
                if (isnew){
                    edit_ds_content.push(newRow)
                }
                new_ds_content.push(newRow)
            } else {
                return(new_ds_content.push(row))
            }
        })
        const newState = {...this.state};
        newState.ds_content = new_ds_content;
        newState.edit_ds_content = edit_ds_content;
        this.setState(newState);
        return (newRow);
    }

    handleClear=() =>{
        const newState = {...this.state};
        newState.ds_content = [];
        newState.edit_ds_content = [];
        this.setState(newState);
    }

    handleOkClickDialog=() => {
        this.state.edit_ds_content.forEach((row)=>{
            this.props.onEditSave(this.props.global.backend_instance, row);
        });
        this.state.ds_content.forEach((row)=>{
            if(row.is_excluding){
                this.props.onDeleteDataSource(
                    this.props.global.backend_instance,
                    row.name
                );
            }
        });
        this.props.onHandleStateEditDs(false)
        this.handleClear()
    }

    handleCancelClickDialog=() => {
        this.props.onHandleStateEditDs(false)
        this.handleClear()
    }

    handleProcessRowUpdateError=(error) => {
        console.log("valor do error", error)
    }

    /** Description.
    * @param ``: 
    * @returns */
    filterData=(row) => {
        return(row.active && row.collector_id===this.props.collector.selected.id)
    }

    handleRestoreClick = (params) => () => {
        let list_ds = this.state.ds_content.map((row) => {
            if(row.name === params.id){
                row['is_excluding'] = false
            }
            return(row)
        })
        const newState = {...this.state};
        newState.ds_content = list_ds;
        this.setState(newState);
    };
    
    handleDeleteClick = (params) => () => {
        let list_ds = this.state.ds_content.map((row) => {
            if(row.name === params.id){
                row['is_excluding'] = true
            }
            return(row)
        })
        const newState = {...this.state};
        newState.ds_content = list_ds;
        this.setState(newState);
    };

    getRowClassName=(params) => {
        if (params.row.is_excluding) {
            return 'Delete';
        }
    }

    /** Defines the component visualization.
    * @returns JSX syntax element */ 
    render(){
        const header = [
            {field: 'actions', type: 'actions', cellClassName: 'actions',
                getActions: (params) => {
                    return[<GridActionsCellItem
                      icon={<RestoreIcon />}
                      label="Edit"
                      onClick={this.handleRestoreClick(params)}
                      color="inherit"
                    />,
                    <GridActionsCellItem
                      icon={<DeleteIcon />}
                      label="Delete"
                      onClick={this.handleDeleteClick(params)}
                      color="inherit"
                    />,
            ]},},
            {field: "name", headerName:"Name",editable: false, flex:1},
            {field: "plc_ip", headerName:"IP Address",editable: true, flex:1},
            {field: "plc_port", headerName:"PLC Port",editable: true, flex:1},
            {field: "timeout", headerName:"Time Out",editable: true, flex:1},
            {field: "cycletime", headerName:"Cycle Time",editable: true, flex:1},
            {field: "protocol", headerName: "Protocol", editable: false, flex:1,
                valueGetter: (params) => params.row.protocol.name
            },
        ]

        const jsx_component = (
                <DialogFullScreen
                    open={this.props.OpenDialog}
                    title={"Data Source"}
                    onOkClick={this.handleOkClickDialog}
                    onCancelClick={this.handleCancelClickDialog}
                >
                    <Box
                        sx={{
                            '& .Delete': {
                                backgroundColor: '#ff6961',
                                color: '#000',
                            }
                        }}
                    >
                        <EditTable 
                            headers={header}
                            content_rows={this.state.ds_content}
                            processRowUpdate={this.processRowUpdate}
                            handleProcessRowUpdateError={this.handleProcessRowUpdateError}
                            getRowClassName={(params) => this.getRowClassName(params)}
                        />
                    </Box>
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
    onHandleStateEditDs:(state)=>dispatch(datasourceActions.handleStateEditDs(state)),
    onEditSave:(api,info)=>dispatch(datasourceActions.putData(api,info)),
    onDeleteDataSource:(api,ds_name)=>dispatch(datasourceActions.deleteData(api,ds_name)),
});

// Make this component visible on import
export default connect(reduxStateToProps,reduxDispatchToProps)(DataSourcePopup);