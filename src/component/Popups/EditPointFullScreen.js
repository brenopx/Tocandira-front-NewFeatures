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
import { Button, FormControl, InputLabel, 
    OutlinedInput, Stack } from '@mui/material';//import './DataSourcePopup.css';

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
        dp_content: [],
        name_button_new_rows: "Add New Rows",
        number_rows: 1,
        length_dp_content: null
    };
    
    handleDsContent= () =>{
        let list_dp = this.props.datapoint.dp_content.filter(this.filterData)
        list_dp.forEach( (row) =>{
            row['row_state'] = 'no_alterations'
        })
        const newState = {...this.state};
        newState.dp_content = list_dp;
        newState.length_dp_content = list_dp.length
        this.setState(newState);
    }

    processRowUpdate= (newRow) =>{
        let new_dp_content = []
        let list_dp = JSON.parse(JSON.stringify(this.state.dp_content))
        list_dp.forEach( (row) =>{
            if(row.table_id === newRow.table_id){
                if(row.row_state === 'NewRow'){
                    new_dp_content.push(newRow)
                } else {
                    newRow['access'] = row['access']
                    newRow['row_state'] = 'Edited'
                    new_dp_content.push(newRow)
                }
            } else {
                new_dp_content.push(row)
            }
        })
        const newState = {...this.state};
        newState.dp_content = new_dp_content;
        this.setState(newState);
        return (newRow);
    }

    handleClear= () =>{
        const newState = {...this.state};
        newState.dp_content = [];
        this.setState(newState);
    }

    handleOkClickDialog= () =>{
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
            } else if(row.row_state === 'NewRow'){
                this.props.onNewSave(
                    this.props.global.backend_instance,
                    row
                );
            }
        });
        this.props.onHandleStateEditDp(false);
        this.handleClear();
    }

    handleCancelClickDialog= () =>{
        this.props.onHandleStateEditDp(false);
        this.handleClear();
    }

    handleProcessRowUpdateError= (error) => {
        console.log("valor do error", error);
    }

    handleRestoreClick= (params) => () =>{
        let row_defaults = JSON.parse(JSON.stringify(this.props.datapoint.dp_defaults['Siemens']));
        let copy_ds_content = JSON.parse(JSON.stringify(this.state.dp_content));
        let list_ds_no_alterations = this.props.datapoint.dp_content.filter(this.filterData)
        let new_list_dp = []
        let row_no_alterations = undefined
        list_ds_no_alterations.forEach( (row) => {
            if(row.table_id === params.id){
                row_no_alterations = row
                row_no_alterations['row_state'] = 'no_alterations'
            }
        })
        new_list_dp = copy_ds_content.map( (row) => {
            if(row_no_alterations !== undefined && row_no_alterations.table_id === row.table_id){
                return (row_no_alterations)
            } else if(row.row_state === "NewRow" && row.table_id === params.id){
                let row_empty = row
                row_empty.name = row_defaults.name
                row_empty.description = row_defaults.description
                row_empty.datasource_name = row_defaults.datasource_name
                row_empty.num_type = row_defaults.num_type.defaultValue
                row_empty.timeout = row_defaults.timeout
                return(row_empty)
            } else {
                return(row)
            }
        })
        const newState = {...this.state};
        newState.dp_content = new_list_dp;
        this.setState(newState);
    };
    
    handleDeleteClick= (params) => () =>{
        let copy_dp_content = JSON.parse(JSON.stringify(this.state.dp_content));
        let newlist_dp = []
        if(params.row.row_state === "NewRow"){
            copy_dp_content.map( (row) => {
                if(row.table_id === params.id){
                    return(row)
                }
                newlist_dp.push(row)
                return(row)
            })
        } else {
            copy_dp_content.map( (row) => {
                if(row.table_id === params.id){
                    row['row_state'] = 'Delete'
                }
                newlist_dp.push(row)
                return(row)
            })
        }
        const newState = {...this.state};
        newState.dp_content = newlist_dp;
        this.setState(newState);
    };

    getRowClassName= (params) =>{
        return(params.row.row_state)
    }

    handleChangeNumberRows = (event) =>{
        const newState = {...this.state};
        newState.number_rows = event.target.value
        this.setState(newState);
    };

    HandleClickButtonNewRows= () =>{
        let copy_dp_content = JSON.parse(JSON.stringify(this.state.dp_content));
        let new_list_dp = [...copy_dp_content]
        let counter = this.state.number_rows
        let number_id = this.state.length_dp_content

        while (counter >= 1) {
            let new_row = JSON.parse(JSON.stringify(this.props.datapoint.dp_defaults['Siemens']));
            new_row.table_id = number_id
            new_row.num_type = new_row.num_type.defaultValue
            new_row.row_state = 'NewRow'
            new_list_dp = [...new_list_dp, new_row]
            counter -= 1
            number_id += 1
        }

        const newState = {...this.state};
        newState.dp_content = new_list_dp
        newState.length_dp_content = number_id
        this.setState(newState);
    };

    stateRowsRestore = (params) =>{
        if(params.row.row_state === "no_alterations"){
            return(true)
        }else{
            return(false)
        }
    }

    stateRowsDelete = (params) =>{
        if(params.row.row_state === "Delete"){
            return(true)
        }else{
            return(false)
        }    
    }

    columnActions=(params) =>{
        let component = ([<GridActionsCellItem
            icon={<RestoreIcon />}
            disabled={this.stateRowsRestore(params)}
            label="Restore"
            onClick={this.handleRestoreClick(params)}
            color="inherit"
        />,
        <GridActionsCellItem
            icon={<DeleteIcon />}
            disabled={this.stateRowsDelete(params)}
            label="Delete"
            onClick={this.handleDeleteClick(params)}
            color="inherit"
        />])
        return (component)
    };

    /** Description.
    * @param ``: 
    * @returns */
    filterData= (row) =>{
        const ds_name = row.datasource_name
        const ds = this.props.datasource.ds_content.filter(row=>row.name===ds_name)[0]
        if(ds){
            return(row.active && ds.collector_id===this.props.collector.selected.id)
        } else  {
            return(false)
        }
    }

    /** Defines the component visualization.
    * @returns JSX syntax element */ 
    render(){
        const header = [
            {
                field: 'actions', type: 'actions', cellClassName: 'actions',
                getActions: (params) => this.columnActions(params)
            },
            {field: "name", headerName:"Name",editable: true, flex:1},
            {field: "description", headerName:"Description",editable: true, flex:1},
            {field: "num_type", headerName:"Num Type",editable: true, flex:1},
            {field: "datasource_name", headerName:"Data Source",editable: true, flex:1},
            {field: "access", headerName:"Access", editable: false, flex:1,
                valueGetter: (params) => params.row.access.name
            },
        ]

        const input_component = (
            <Stack direction='row' spacing='1rem' marginTop='1rem' alignSelf='start'>
                <Button variant="contained" onClick={this.HandleClickButtonNewRows} >
                    {this.state.name_button_new_rows}
                </Button>
                <FormControl>
                    <InputLabel htmlFor="component-outlined">{this.state.name_button_new_rows}</InputLabel>
                    <OutlinedInput id="component-Number_Rows" type="number"
                        value={this.state.number_rows} label={this.state.name_button_new_rows}
                        onChange={this.handleChangeNumberRows} 
                    />
                </FormControl>
            </Stack>
        )

        const body_component = (
            <Stack
                sx={{
                    '& .Delete': {
                        backgroundColor: '#f8d2d0',
                        color: '#000',
                    },'& .Edited': {
                        backgroundColor: '#ffffd1',
                        color: '#000',
                    },'& .NewRow': {
                        backgroundColor: '#d7f9d6',
                        color: '#000',
                    },
                    'display': 'flex',
                    'direction': 'row'
                }}
            >
                <EditTable 
                    headers={header}
                    content_rows={this.state.dp_content}
                    processRowUpdate={this.processRowUpdate}
                    handleProcessRowUpdateError={this.handleProcessRowUpdateError}
                    getRowClassName={(params) => this.getRowClassName(params)}
                />
                {input_component}
            </Stack>
        )

        const jsx_component = (
                <DialogFullScreen
                    open={this.props.OpenDialog}
                    title={"Data Point"}
                    onOkClick={this.handleOkClickDialog}
                    onCancelClick={this.handleCancelClickDialog}
                >
                    {body_component}
                </DialogFullScreen>
        );
        return(jsx_component);
    }

    componentDidMount= () =>{
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
    onHandleStateEditDp: (state) => dispatch(datapointActions.handleStateEditDp(state)),
    onEditSave: (api, info) => dispatch(datapointActions.putData(api, info)),
    onDeleteDataPoint: (api, dp_name) => dispatch(datapointActions.deleteData(api, dp_name)),
    onNewSave: (api, info) => dispatch(datapointActions.pushData(api, info)),
});

// Make this component visible on import
export default connect(reduxStateToProps, reduxDispatchToProps)(DataSourcePopup);