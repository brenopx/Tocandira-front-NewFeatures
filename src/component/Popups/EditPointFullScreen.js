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
        dp_content:[],
    };
    
    handleDsContent=() => {
        let list_dp = this.props.datapoint.dp_content.filter(this.filterData)
        list_dp.forEach((row) => {
            row['row_state'] = 'no_alterations'
        })
        const newState = {...this.state};
        newState.dp_content = list_dp;
        this.setState(newState);
    }

    processRowUpdate=(newRow) =>{
        let new_dp_content = []
        let list_dp = this.state.dp_content
        list_dp.forEach((row) => {
            if(row.name === newRow.name){
                newRow['access'] = row['access']
                newRow['row_state'] = 'Edited'
                new_dp_content.push(newRow)
            } else {
                new_dp_content.push(row)
            }
        })
        const newState = {...this.state};
        newState.dp_content = new_dp_content;
        this.setState(newState);
        return (newRow);
    }

    handleClear=() =>{
        const newState = {...this.state};
        newState.dp_content = [];
        this.setState(newState);
    }

    handleOkClickDialog=() => {
        this.state.dp_content.forEach((row)=>{
            if(row.row_state === 'Delete'){
                this.props.onDeleteDataPoint(
                    this.props.global.backend_instance,
                    row.name
                );
            } else if(row.row_state === 'Edited'){
                this.props.onEditSave(
                    this.props.global.backend_instance, 
                    row
                );
            }
        });
        this.props.onHandleStateEditDp(false);
        this.handleClear();
    }

    handleCancelClickDialog=() => {
        this.props.onHandleStateEditDp(false);
        this.handleClear();
    }

    handleProcessRowUpdateError=(error) => {
        console.log("valor do error", error);
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

    handleRestoreClick = (params) => () => {
        let new_row = []
        let list_dp_no_alterations = this.props.datapoint.dp_content.filter(this.filterData)
        list_dp_no_alterations.forEach((row_no_alterations) => {
            if(row_no_alterations.name === params.id){
                new_row = row_no_alterations
                new_row['row_state'] = 'no_alterations'
            }
        })
        let list_dp = this.state.dp_content.map((row) => {
            if(row.name === params.id){
                row = new_row
                return(row)
            } else {return (row)}
        })
        const newState = {...this.state};
        newState.dp_content = list_dp;
        this.setState(newState);
    };
    
    handleDeleteClick = (params) => () => {
        let list_dp = this.state.dp_content.map((row) => {
            if(row.name === params.id){
                row['row_state'] = 'Delete'
            }
            return(row)
        })
        const newState = {...this.state};
        newState.dp_content = list_dp;
        this.setState(newState);
    };

    getRowClassName=(params) => {
        return (params.row.row_state)
    }

    /** Defines the component visualization.
    * @returns JSX syntax element */ 
    render(){
        const header = [
            {field: 'actions', type: 'actions', cellClassName: 'actions',
            getActions: (params) => {
                return[<GridActionsCellItem
                    icon={<RestoreIcon />}
                    disabled={params.row.row_state === "Delete" || params.row.row_state === "Edited" ? false : true}
                    label="Edit"
                    onClick={this.handleRestoreClick(params)}
                    color="inherit"
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    disabled={params.row.row_state === "no_alterations" || params.row.row_state === "Edited" ? false : true}
                    label="Delete"
                    onClick={this.handleDeleteClick(params)}
                    color="inherit"
                />,
            ]},},
            {field: "name", headerName:"Name",editable: false, flex:1},
            {field: "description", headerName:"Description",editable: true, flex:1},
            {field: "num_type", headerName:"Num Type",editable: true, flex:1},
            {field: "datasource_name", headerName:"Data Source",editable: true, flex:1},
            {field: "access", headerName:"Access", editable: false, flex:1,
                valueGetter: (params) => params.row.access.name
            },
        ]

        const jsx_component = (
                <DialogFullScreen
                    open={this.props.OpenDialog}
                    title={"Data Point"}
                    onOkClick={this.handleOkClickDialog}
                    onCancelClick={this.handleCancelClickDialog}
                >
                    <Box
                        sx={{
                            '& .Delete': {
                                backgroundColor: '#ff6961',
                                color: '#000',
                            },'& .Edited': {
                                backgroundColor: '#ffffd1',
                                color: '#000',
                            },'& .New_Row': {
                                backgroundColor: '#81ff8a',
                                color: '#000',
                            }
                        }}
                    >
                        <EditTable 
                            headers={header}
                            content_rows={this.state.dp_content}
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
    onHandleStateEditDp:(state)=>dispatch(datapointActions.handleStateEditDp(state)),
    onEditSave:(api,info)=>dispatch(datapointActions.putData(api,info)),
    onDeleteDataPoint:(api,dp_name)=>dispatch(datapointActions.deleteData(api,dp_name)),
});

// Make this component visible on import
export default connect(reduxStateToProps,reduxDispatchToProps)(DataSourcePopup);