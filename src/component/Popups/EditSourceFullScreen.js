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
import DeletePopup from '../../component/Popups/DeletePopup';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { Button, FormControl, InputLabel, Box,
    OutlinedInput, Stack, Tab, Tabs, Card, CardContent } from '@mui/material';
import { Restore, Delete, HourglassEmpty,
    Close, Done } from '@mui/icons-material';
// #######################################

/** Description
 * @property ``
 * @returns */
function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
          role="tabpanel"
          hidden={value !== index}
          id={`simple-tabpanel-${index}`}
          aria-labelledby={`simple-tab-${index}`}
          {...other}
        >
          {value === index && (
            <Box>
              {children}
            </Box>
          )}
        </div>
    );
};

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
        length_ds_content: null,
        name_button_new_rows: "Add New Rows",
        number_rows: 1,
        open_cancel: false,
        state_popus_cancel: false,
        delete_content: { title: "", msg: "" },
        protocol_body_content: 'Siemens',
        options_select: [],
        value : 0,
    };

    handleDsContent=() => {
        console.log("Criando ", this.state.ds_content)
        let list_ds = this.props.datasource.ds_content.filter(this.filterData);
        list_ds.forEach((row) => {
            row['row_state'] = 'no_alterations'
        });
        let options_protocol = JSON.parse(JSON.stringify(
            this.props.datasource.ds_defaults[this.state.protocol_body_content].protocol.data.plc.menuItems
        ));
        const newState = {...this.state};
        newState.ds_content = list_ds;
        newState.length_ds_content = list_ds.length;
        newState.options_select = options_protocol;
        this.setState(newState);
    };

    processRowUpdate=(newRow) => {
        let new_ds_content = [];
        let list_ds = JSON.parse(JSON.stringify(this.state.ds_content));
        if (this.state.protocol_body_content === 'Siemens'){
            newRow.protocol.data.plc = newRow.plc
            newRow.protocol.data.rack = newRow.rack
            newRow.protocol.data.slot = newRow.slot
        } else if (this.state.protocol_body_content === 'Rockwell'){
            newRow.protocol.data.path = newRow.path
            newRow.protocol.data.slot = newRow.slot
            newRow.protocol.data.connection = newRow.connection
        } else if (this.state.protocol_body_content === 'Modbus'){
            newRow.protocol.data.slave_id = newRow.slave_id
        } else {}
        list_ds.forEach((row) => {
            if (row.table_id === newRow.table_id) {
                if (row.row_state === 'NewRow' || row.row_state === 'errorNewRow') {
                    new_ds_content.push(newRow)
                } else {
                    newRow['row_state'] = 'Edited'
                    new_ds_content.push(newRow)
                }
            } else {
                new_ds_content.push(row)
            }
        });
        const newState = {...this.state};
        newState.ds_content = new_ds_content;
        newState.state_popus_cancel = true;
        this.setState(newState);
        return(newRow);
    };

    handleClear= () => {
        console.log("limpando...")
        const newState = {...this.state};
        newState.ds_content = []
        newState.length_ds_content= null
        newState.name_button_new_rows= "Add New Rows"
        newState.number_rows= 1
        newState.open_cancel= false
        newState.state_popus_cancel= false
        newState.delete_content= { title: "", msg: "" }
        newState.protocol_body_content= 'Siemens'
        newState.options_select= []
        newState.value = 0
        this.setState(newState);
    };

    handleOkClickDialog=async() => {
        let copy_ds_content = JSON.parse(JSON.stringify(this.state.ds_content));
        let list_result = await this.props.onListSaveNew(
            this.props.global.backend_instance,
            copy_ds_content
        );
        let new_list_ds = [];
        list_result.forEach((row) => {
            if (row.row_state === "Delete") {
                return
            } else {
                new_list_ds.push(row)
            }
        })
        const newState = {...this.state};
        newState.ds_content = new_list_ds;
        newState.state_popus_cancel = false;
        this.setState(newState);
    };

    handleCancelClickDialog=() => {
        if (this.state.state_popus_cancel) {
            const delete_title = 'Do you want to exit without saving the changes you made?';
            const delete_msg = 'Your changes will be lost if you continue.';

            const newState = {...this.state};
            newState.delete_content = { title: delete_title, msg: delete_msg };
            newState.open_cancel = true;
            this.setState(newState);
        } else {
            this.props.onHandleStateEditDs(false);
            this.handleClear();
        }
    };

    handleDeleteProceed=() => {
        this.props.onHandleStateEditDs(false);
        this.handleClear();
    };

    handleDeleteCancel=() => {
        const newState = {...this.state};
        newState.open_cancel = false;
        this.setState(newState);
    };

    handleProcessRowUpdateError=(error) => {
        console.log("valor do error", error);
    };

    handleRestoreClick=(params) =>() => {
        let row_defaults = JSON.parse(JSON.stringify(
            this.props.datasource.ds_defaults[this.state.protocol_body_content]
        ));
        let copy_ds_content = JSON.parse(JSON.stringify(this.state.ds_content));
        let list_ds_no_alterations = this.props.datasource.ds_content.filter(this.filterData);
        let new_list_ds = [];
        let row_no_alterations = undefined;
        list_ds_no_alterations.forEach((row) =>{
            if (row.table_id === params.id) {
                row_no_alterations = row
                row_no_alterations['row_state'] = 'no_alterations'
            }
        });
        new_list_ds = copy_ds_content.map((row) => {
            if (row_no_alterations !== undefined && row_no_alterations.table_id === row.table_id) {
                return(row_no_alterations)
            } else if ((row.row_state === "NewRow" || row.row_state === "errorNewRow") && row.table_id === params.id) {
                let row_empty = row
                if (this.state.protocol_body_content === 'Siemens'){
                    row_empty.protocol.data.plc = row_defaults.protocol.data.plc.defaultValue
                } else if (this.state.protocol_body_content === 'Rockwell'){
                    row_empty.protocol.data.connection = row_defaults.protocol.data.connection.defaultValue
                } else if (this.state.protocol_body_content === 'Modbus'){} else {}
                row_empty.name = row_defaults.name
                row_empty.plc_ip = row_defaults.plc_ip
                row_empty.plc_port = row_defaults.plc_port
                return(row_empty)
            } else {
                return(row)
            }
        })
        const newState = {...this.state};
        newState.ds_content = new_list_ds;
        this.setState(newState);
    };

    handleDeleteClick=(params) =>() => {
        let copy_ds_content = JSON.parse(JSON.stringify(this.state.ds_content));
        let newlist_ds = [];
        copy_ds_content.map((row) => {
            if (params.row.row_state === "NewRow" || params.row.row_state === "errorNewRow") {
                if (row.table_id === params.id) {
                    return(row)
                }
            }
            if (row.table_id === params.id) {
                row['row_state'] = 'Delete'
            }
            newlist_ds.push(row)
            return(row)
        });
        const newState = {...this.state};
        newState.ds_content = newlist_ds;
        this.setState(newState);
    };

    getRowClassName=(params) => {
        return(params.row.row_state)
    };

    handleChangeNumberRows=(event) => {
        const newState = {...this.state};
        newState.number_rows = event.target.value
        this.setState(newState);
    };

    HandleClickButtonNewRows=() => {
        let new_row = JSON.parse(JSON.stringify(
            this.props.datasource.ds_defaults[this.state.protocol_body_content]
        ));
        let copy_ds_content = JSON.parse(JSON.stringify(this.state.ds_content));
        let counter = this.state.number_rows;
        let number_id = this.state.length_ds_content;
        let new_list_ds = [...copy_ds_content];
        while(counter >= 1) {
            new_row.table_id = number_id
            new_row.collector_id = this.props.collector.selected.id
            if (this.state.protocol_body_content === 'Siemens'){
                new_row.protocol.data.plc = new_row.protocol.data.plc.defaultValue
            } else if (this.state.protocol_body_content === 'Rockwell'){
                new_row.protocol.data.connection = new_row.protocol.data.connection.defaultValue
            } else if (this.state.protocol_body_content === 'Modbus'){} else {}
            new_row.row_state = 'NewRow'
            counter -= 1
            number_id += 1
            new_list_ds.push(new_row)
        }
        const newState = {...this.state};
        newState.ds_content = new_list_ds;
        newState.length_ds_content = number_id
        newState.state_popus_cancel = true
        this.setState(newState);
    };

    stateRowsRestore=(params) => {
        if (params.row.row_state === "no_alterations") {
            return (true)
        } else {
            return(false)
        }
    };

    stateRowsDelete=(params) => {
        if (params.row.row_state === "Delete" 
            || params.row.row_state === "errorDelete"
        ) {
            return(true)
        } else {
            return(false)
        }
    };

    columnActions=(params) => {
        let icon = null;
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
        return(component)
    };

    handleBodyComponent=(protocol, header, rows) => {
        let rows_body_component = [];
        rows.forEach((row) =>{
            if (row.protocol.name === protocol) {
                rows_body_component.push(row)
            }
        });
        const ele = <Card sx={{flex:'1 1 auto', borderRadius:'0 0 1rem 1rem'}}>
            <CardContent>
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
                    'direction': 'row',
                    'padding': '1rem',
                }}
            >
                <EditTable
                    headers={header}
                    content_rows={rows_body_component}
                    processRowUpdate={this.processRowUpdate}
                    handleProcessRowUpdateError={this.handleProcessRowUpdateError}
                    getRowClassName={(params) => this.getRowClassName(params)}
                />
                <Stack direction='row' spacing='1rem' marginTop='1rem' alignSelf='start'>
                    <Button variant="contained" onClick={this.HandleClickButtonNewRows} >
                        {this.state.name_button_new_rows}
                    </Button>
                    <FormControl>
                        <InputLabel htmlFor="component-outlined">{this.state.name_button_new_rows}</InputLabel>
                        <OutlinedInput id="component-Number_Rows" type="number"
                            value={this.state.number_rows} label={this.state.name_button_new_rows}
                            onChange={this.handleChangeNumberRows} size='small'
                        />
                    </FormControl>
                </Stack>
            </Stack>
            </CardContent>
        </Card>
        return(ele)
    };

    handleChangeTab=(event, newValue) => {
        let protocol = undefined;
        let options_protocol = [];
        if (newValue === 0){
            protocol = "Siemens"
            options_protocol = JSON.parse(JSON.stringify(
                this.props.datasource.ds_defaults["Siemens"].protocol.data.plc.menuItems
            ));
        } else if (newValue === 1) {
            protocol = "Rockwell"
            options_protocol = JSON.parse(JSON.stringify(
                this.props.datasource.ds_defaults["Rockwell"].protocol.data.connection.menuItems
            ));
        } else  if (newValue === 2) {
            protocol = "Modbus"
        } else {}
        const newState = {...this.state};
        newState.value = newValue
        newState.protocol_body_content = protocol
        newState.options_select = options_protocol
        this.setState(newState);
    };

    /** Description.
    * @param ``: 
    * @returns */
    filterData=(row) => {
        return(row.active && row.collector_id === this.props.collector.selected.id)
    };

    /** Defines the component visualization.
    * @returns JSX syntax element */
    render(){
        const header_siemens = [
            {
                field: 'actions', type: 'actions', cellClassName: 'actions',
                getActions: (params) => this.columnActions(params)
            },
            { field: "name", headerName: "Name", editable: true, flex: 1 },
            { field: "plc_ip", headerName: "IP Address", editable: true, flex: 1 },
            { field: "plc_port", headerName: "PLC Port", editable: true, flex: 1 },
            {
                field: "rack", headerName: "Rack", editable: true, flex: 1,
                valueGetter: (params) => params.row.protocol.data.rack
            },
            {
                field: "slot", headerName: "Slot", editable: true, flex: 1,
                valueGetter: (params) => params.row.protocol.data.slot
            },
            {
                field: "plc", headerName: "PLC Model", type: 'singleSelect', 
                editable: true, flex: 1, valueOptions: this.state.options_select,
                valueGetter: (params) => params.row.protocol.data.plc
            },
        ];

        const header_rockwell = [
            {
                field: 'actions', type: 'actions', cellClassName: 'actions',
                getActions: (params) => this.columnActions(params)
            },
            { field: "name", headerName: "Name", editable: true, flex: 1 },
            { field: "plc_ip", headerName: "IP Address", editable: true, flex: 1 },
            { field: "plc_port", headerName: "PLC Port", editable: true, flex: 1 },
            {
                field: "path", headerName: "Path", editable: true, flex: 1,
                valueGetter: (params) => params.row.protocol.data.path
            },
            {
                field: "slot", headerName: "Slot", editable: true, flex: 1,
                valueGetter: (params) => params.row.protocol.data.slot
            },
            {
                field: "connection", headerName: "Connection", type: 'singleSelect', 
                editable: true, flex: 1, valueOptions: this.state.options_select,
                valueGetter: (params) => params.row.protocol.data.connection
            },
        ];

        const header_modbus = [
            {
                field: 'actions', type: 'actions', cellClassName: 'actions',
                getActions: (params) => this.columnActions(params)
            },
            { field: "name", headerName: "Name", editable: true, flex: 1 },
            { field: "plc_ip", headerName: "IP Address", editable: true, flex: 1 },
            { field: "plc_port", headerName: "PLC Port", editable: true, flex: 1 },
            {
                field: "slave_id", headerName: "Slave Id", editable: true, flex: 1,
                valueGetter: (params) => params.row.protocol.data.slave_id
            },
        ]; 

        const delete_popup = (
            <DeletePopup open={this.state.open_cancel}
                content={this.state.delete_content}
                nameOk={"EXIT"} nameCancel={"CANCEL"}
                onOkClick={this.handleDeleteProceed}
                onCancelClick={this.handleDeleteCancel} />
        );

        const tabs = (
            <Box>
                <Tabs
                    value={this.state.value}
                    onChange={this.handleChangeTab}
                    TabIndicatorProps={{
                        style: {
                        backgroundColor: 'white',
                        height:'100%',
                        borderRadius: '1rem 1rem 0 0',
                        }
                    }}
                    textColor="inherit"
                    aria-label="full-width-tabs"
                    sx={{
                        backgroundColor: '#eee'
                    }}
                >
                    <Tab style={{ zIndex: 1 }} label="Siemens" />
                    <Tab style={{ zIndex: 1 }} label="Rockwell" />
                    <Tab style={{ zIndex: 1 }} label="Modbus" />
                </Tabs>
                <CustomTabPanel value={this.state.value} index={0}>
                    {this.handleBodyComponent("Siemens", header_siemens, this.state.ds_content)}
                </CustomTabPanel>
                <CustomTabPanel value={this.state.value} index={1}>
                    {this.handleBodyComponent("Rockwell", header_rockwell, this.state.ds_content)}
                </CustomTabPanel>
                <CustomTabPanel value={this.state.value} index={2}>
                    {this.handleBodyComponent("Modbus", header_modbus, this.state.ds_content)}
                </CustomTabPanel>
            </Box>
        );

        const jsx_component = (
            <DialogFullScreen
                open={this.props.OpenDialog}
                title={"Data Source"}
                onOkClick={this.handleOkClickDialog}
                onCancelClick={this.handleCancelClickDialog}
            >
                {tabs}
                {delete_popup}
            </DialogFullScreen>
        );
        return(jsx_component);
    };

    componentDidMount=() => {
        this.handleDsContent();
    };
}

/** Map the Redux state to some component props */
const reduxStateToProps= (state) =>({
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