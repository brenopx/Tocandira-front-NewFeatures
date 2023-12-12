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
import EditTable from '../DataTable/EditTable'
import DialogFullScreen from './DialogFullScreen'
import {
    GridActionsCellItem,
} from '@mui/x-data-grid';
import {
    Button, FormControl, InputLabel,
    OutlinedInput, Stack
} from '@mui/material';
import {
    Restore, Delete, HourglassEmpty,
    Close, Done
} from '@mui/icons-material';
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
        ds_content: [],
        name_button_new_rows: "Add New Rows",
        number_rows: 1,
        length_ds_content: null
    };

    handleDsContent = () => {
        let list_ds = this.props.datasource.ds_content.filter(this.filterData)
        list_ds.forEach((row) => {
            row['row_state'] = 'no_alterations'
        })
        const newState = { ...this.state };
        newState.ds_content = list_ds;
        newState.length_ds_content = list_ds.length;
        this.setState(newState);
    };

    processRowUpdate = (newRow) => {
        let new_ds_content = []
        let list_ds = JSON.parse(JSON.stringify(this.state.ds_content))
        list_ds.forEach((row) => {
            if (row.table_id === newRow.table_id) {
                if (row.row_state === 'NewRow' || row.row_state === 'errorNewRow') {
                    new_ds_content.push(newRow)
                } else {
                    newRow['protocol'] = row['protocol']
                    newRow['row_state'] = 'Edited'
                    new_ds_content.push(newRow)
                }
            } else {
                new_ds_content.push(row)
            }
        })
        const newState = { ...this.state };
        newState.ds_content = new_ds_content;
        this.setState(newState);
        return (newRow);
    };

    handleClear = () => {
        const newState = { ...this.state };
        newState.ds_content = [];
        this.setState(newState);
    };

    handleOkClickDialog = async () => {
        let copy_ds_content = JSON.parse(JSON.stringify(this.state.ds_content));
        let list_result = await this.props.onListSaveNew(
            this.props.global.backend_instance,
            copy_ds_content
        )
        let new_list_ds = []
        list_result.forEach((row) => {
            if (row.row_state === "Delete") {
                return
            } else {
                new_list_ds.push(row)
            }
        })
        const newState = { ...this.state };
        newState.ds_content = new_list_ds;
        this.setState(newState);
    };

    handleCancelClickDialog = () => {
        this.props.onHandleStateEditDs(false);
        this.handleClear();
    };

    handleDeleteProceed = () => {
        this.props.onHandleStateEditDs(false);
        this.handleClear();
    }

    handleDeleteCancel = () => {
        const newState = { ...this.state };
        newState.open_cancel = false;
        this.setState(newState);
    }

    handleProcessRowUpdateError = (error) => {
        console.log("valor do error", error);
    };

    handleRestoreClick = (params) => () => {
        let row_defaults = JSON.parse(JSON.stringify(this.props.datasource.ds_defaults['Siemens']));
        let copy_ds_content = JSON.parse(JSON.stringify(this.state.ds_content));
        let list_ds_no_alterations = this.props.datasource.ds_content.filter(this.filterData)
        let new_list_ds = []
        let row_no_alterations = undefined
        list_ds_no_alterations.forEach((row) => {
            if (row.table_id === params.id) {
                row_no_alterations = row
                row_no_alterations['row_state'] = 'no_alterations'
            }
        })
        new_list_ds = copy_ds_content.map((row) => {
            if (row_no_alterations !== undefined && row_no_alterations.table_id === row.table_id) {
                return (row_no_alterations)
            } else if ((row.row_state === "NewRow" || row.row_state === "errorNewRow") && row.table_id === params.id) {
                let row_empty = row
                row_empty.name = row_defaults.name
                row_empty.plc_ip = row_defaults.plc_ip
                row_empty.plc_port = row_defaults.plc_port
                row_empty.cycletime = row_defaults.cycletime
                row_empty.timeout = row_defaults.timeout
                return (row_empty)
            } else {
                return (row)
            }
        })
        const newState = { ...this.state };
        newState.ds_content = new_list_ds;
        this.setState(newState);
    };

    handleDeleteClick = (params) => () => {
        let copy_ds_content = JSON.parse(JSON.stringify(this.state.ds_content));
        let newlist_ds = []
        copy_ds_content.map((row) => {
            if (params.row.row_state === "NewRow" || params.row.row_state === "errorNewRow") {
                if (row.table_id === params.id) {
                    return (row)
                }
            }
            if (row.table_id === params.id) {
                row['row_state'] = 'Delete'
            }
            newlist_ds.push(row)
            return (row)
        })
        const newState = { ...this.state };
        newState.ds_content = newlist_ds;
        this.setState(newState);
    };

    getRowClassName = (params) => {
        return (params.row.row_state)
    };

    handleChangeNumberRows = (event) => {
        const newState = { ...this.state };
        newState.number_rows = event.target.value
        this.setState(newState);
    };

    HandleClickButtonNewRows = () => {
        let copy_ds_content = JSON.parse(JSON.stringify(this.state.ds_content));
        let counter = this.state.number_rows
        let number_id = this.state.length_ds_content
        let new_list_ds = [...copy_ds_content]
        while (counter >= 1) {
            let new_row = JSON.parse(JSON.stringify(this.props.datasource.ds_defaults['Siemens']));
            new_row.table_id = number_id
            new_row.collector_id = this.props.collector.selected.id
            new_row.protocol.data.plc = new_row.protocol.data.plc.defaultValue
            new_row.row_state = 'NewRow'
            counter -= 1
            number_id += 1
            new_list_ds.push(new_row)
        }
        const newState = { ...this.state };
        newState.ds_content = new_list_ds;
        newState.length_ds_content = number_id
        this.setState(newState);
    };

    stateRowsRestore = (params) => {
        if (params.row.row_state === "no_alterations") {
            return (true)
        } else {
            return (false)
        }
    };

    stateRowsDelete = (params) => {
        if (params.row.row_state === "Delete" || params.row.row_state === "errorDelete") {
            return (true)
        } else {
            return (false)
        }
    };

    columnActions = (params) => {
        let icon = null
        if (params.row.row_state === "errorDelete"
            || params.row.row_state === "errorEdited"
            || params.row.row_state === "errorNewRow") {
            icon = (<Close />)
        } else if (params.row.row_state === 'no_alterations') {
            icon = (<Done />)
        } else {
            icon = (<HourglassEmpty />)
        }
        let component = ([
            <Stack flexDirection='row'>
                <GridActionsCellItem
                    icon={icon}
                    label="state"
                    color="inherit"
                />
                <GridActionsCellItem
                    icon={<Restore />}
                    disabled={this.stateRowsRestore(params)}
                    label="Restore"
                    onClick={this.handleRestoreClick(params)}
                    color="inherit"
                />
                <GridActionsCellItem
                    icon={<Delete />}
                    disabled={this.stateRowsDelete(params)}
                    label="Delete"
                    onClick={this.handleDeleteClick(params)}
                    color="inherit"
                />
            </Stack>
        ])
        return (component)
    };

    /** Description.
    * @param ``: 
    * @returns */
    filterData = (row) => {
        return (row.active && row.collector_id === this.props.collector.selected.id)
    }

    /** Defines the component visualization.
    * @returns JSX syntax element */
    render() {
        const header = [
            {
                field: 'actions', type: 'actions', cellClassName: 'actions',
                getActions: (params) => this.columnActions(params)
            },
            { field: "name", headerName: "Name", editable: true, flex: 1 },
            { field: "plc_ip", headerName: "IP Address", editable: true, flex: 1 },
            { field: "plc_port", headerName: "PLC Port", editable: true, flex: 1 },
            { field: "timeout", headerName: "Time Out", editable: true, flex: 1 },
            { field: "cycletime", headerName: "Cycle Time", editable: true, flex: 1 },
            {
                field: "protocol", headerName: "Protocol", editable: false, flex: 1,
                valueGetter: (params) => params.row.protocol.name
            },
        ];

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
        );

        const body_component = (
            <Stack
                sx={{
                    '& .Delete': {
                        backgroundColor: '#f8d2d0',
                        color: '#000',
                    }, '& .Edited': {
                        backgroundColor: '#ffffd1',
                        color: '#000',
                    }, '& .NewRow': {
                        backgroundColor: '#d7f9d6',
                        color: '#000',
                    }, '& .errorDelete': {
                        backgroundColor: '#f8d2d0',
                        color: '#000',
                        WebkitTextFillColor: 'red'
                    }, '& .errorEdited': {
                        backgroundColor: '#ffffd1',
                        color: '#000',
                        WebkitTextFillColor: 'red'
                    }, '& .errorNewRow': {
                        backgroundColor: '#d7f9d6',
                        color: '#000',
                        WebkitTextFillColor: 'red'
                    },
                    'display': 'flex',
                    'direction': 'row'
                }}
            >
                <EditTable
                    headers={header}
                    content_rows={this.state.ds_content}
                    processRowUpdate={this.processRowUpdate}
                    handleProcessRowUpdateError={this.handleProcessRowUpdateError}
                    getRowClassName={(params) => this.getRowClassName(params)}
                />
                {input_component}
            </Stack>
        );

        const jsx_component = (
            <DialogFullScreen
                open={this.props.OpenDialog}
                title={"Data Source"}
                onOkClick={this.handleOkClickDialog}
                onCancelClick={this.handleCancelClickDialog}
            >
                {body_component}
            </DialogFullScreen>
        );
        return (jsx_component);
    };

    componentDidMount = () => {
        this.handleDsContent();
    };
}

/** Map the Redux state to some component props */
const reduxStateToProps = (state) => ({
    global: state.global,
    popups: state.popups,
    datapoint: state.datapoint,
    datasource: state.datasource,
    collector: state.collector,
});

/** Map the Redux actions dispatch to some component props */
const reduxDispatchToProps = (dispatch) => ({
    onHandleStateEditDs: (state) => dispatch(datasourceActions.handleStateEditDs(state)),
    onEditSave: (api, info) => dispatch(datasourceActions.putData(api, info)),
    onDeleteDataSource: (api, ds_name) => dispatch(datasourceActions.deleteData(api, ds_name)),
    onNewSave: (api, info) => dispatch(datasourceActions.pushData(api, info)),
    onListSaveNew: (api, list) => dispatch(datasourceActions.pushListNew(api, list)),
});

// Make this component visible on import
export default connect(reduxStateToProps, reduxDispatchToProps)(DataSourcePopup);