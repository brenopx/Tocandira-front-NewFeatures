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
import DeletePopup from '../../component/Popups/DeletePopup';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { Button, FormControl, InputLabel, Box,
    OutlinedInput, Stack, Tab, Tabs, Card, CardContent, Typography } from '@mui/material';
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
            id={`tab-${index}`}
            aria-labelledby={`tabpanel-${index}`}
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
        ds_content_name: [],
        dp_content: [],
        name_button_new_rows: "Add New Rows",
        number_rows: 1,
        length_dp_content: null,
        open_cancel: false,
        state_popus_cancel: false,
        delete_content: { title: "", msg: "" },
        data_source_content: {name: undefined, protocol: 'Siemens'},
        options_select_num_type: [],
        options_select: [],
        value: 0
    };

    handleDsContent=() => {
        let options_protocol_num_type = JSON.parse(JSON.stringify(
            this.props.datapoint.dp_defaults[this.state.data_source_content.protocol].num_type.menuItems
        ));
        let list_ds = this.props.datasource.ds_content.filter(this.filterDataSource);
        let list_dp = this.props.datapoint.dp_content.filter(this.filterData);
        list_dp.forEach((row) => {
            row['row_state'] = 'no_alterations'
        });
        let list_ds_content_name = list_ds.map((row) => {
            return ({name: row.name, protocol: row.protocol.name})
        })
        const newState = {...this.state};
        newState.dp_content = list_dp
        newState.ds_content_name = list_ds_content_name
        newState.length_dp_content = list_dp.length
        newState.options_select_num_type = options_protocol_num_type
        newState.data_source_content = list_ds_content_name[0]
        this.setState(newState);
    };

    processRowUpdate=(newRow) => {
        let new_dp_content = []
        let list_dp = JSON.parse(JSON.stringify(this.state.dp_content))
        list_dp.forEach((row) => {
            if (row.table_id === newRow.table_id) {
                if (row.row_state === 'NewRow' || row.row_state === 'errorNewRow') {
                    new_dp_content.push(newRow)
                } else {
                    newRow['access'] = row['access']
                    newRow['row_state'] = 'Edited'
                    new_dp_content.push(newRow)
                }
            } else {
                new_dp_content.push(row)
            }
        });
        const newState = {...this.state};
        newState.dp_content = new_dp_content;
        this.setState(newState);
        return (newRow);
    };

    handleClear=() =>{
        const newState = {...this.state};
        newState.dp_content = [];
        this.setState(newState);
    };

    handleOkClickDialog=async() => {
        let copy_dp_content = JSON.parse(JSON.stringify(this.state.dp_content));
        let list_result = await this.props.onListSaveNew(
            this.props.global.backend_instance,
            copy_dp_content
        )
        let new_list_dp = []
        list_result.forEach((row) => {
            if (row.row_state === "Delete") {
                return
            } else {
                new_list_dp.push(row)
            }
        });
        const newState = {...this.state};
        newState.dp_content = new_list_dp;
        this.setState(newState);
    };

    handleCancelClickDialog=() => {
        // if (this.state.state_popus_cancel) {
        if (false) {
            const delete_title = 'Do you want to exit without saving the changes you made?';
            const delete_msg = 'Your changes will be lost if you continue.';

            const newState = {...this.state};
            newState.delete_content = { title: delete_title, msg: delete_msg };
            newState.open_cancel = true;
            this.setState(newState);
        } else {
            console.log("Sair ...")
            this.props.onHandleStateEditDp(false);
            this.handleClear();
        }
    };

    handleDeleteProceed= () => {
        this.props.onHandleStateEditDp(false);
        this.handleClear();
    }

    handleDeleteCancel=() => {
        const newState = {...this.state};
        newState.open_cancel = false;
        this.setState(newState);
    }

    handleProcessRowUpdateError = (error) => {
        console.log("valor do error", error);
    };

    handleRestoreClick=(params) =>() => {
        let row_defaults = JSON.parse(JSON.stringify(this.props.datapoint.dp_defaults['Siemens']));
        let copy_dp_content = JSON.parse(JSON.stringify(this.state.dp_content));
        let list_ds_no_alterations = this.props.datapoint.dp_content.filter(this.filterData)
        let new_list_dp = []
        let row_no_alterations = undefined
        let new_state_popus_cancel = false
        list_ds_no_alterations.forEach((row) => {
            if (row.table_id === params.id) {
                row_no_alterations = row
                row_no_alterations['row_state'] = 'no_alterations'
            }
        })
        new_list_dp = copy_dp_content.map((row) => {
            if (row_no_alterations !== undefined && row_no_alterations.table_id === row.table_id) {
                return(row_no_alterations)
            } else if ((row.row_state === "NewRow" || row.row_state === "errorNewRow") && row.table_id === params.id) {
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
        newState.state_popus_cancel = new_state_popus_cancel;
        newState.dp_content = new_list_dp;
        this.setState(newState);
    };

    handleDeleteClick=(params) =>() => {
        let copy_dp_content = JSON.parse(JSON.stringify(this.state.dp_content));
        let newlist_dp = []
        if (params.row.row_state === "NewRow") {
            copy_dp_content.map((row) => {
                if (row.table_id === params.id) {
                    return(row)
                }
                newlist_dp.push(row)
                return(row)
            })
        } else {
            copy_dp_content.map((row) => {
                if (row.table_id === params.id) {
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

    getRowClassName=(params) => {
        return(params.row.row_state)
    };

    handleChangeNumberRows = (event) => {
        const newState = {...this.state};
        newState.number_rows = event.target.value
        this.setState(newState);
    };

    HandleClickButtonNewRows=() => {
        let new_row = JSON.parse(JSON.stringify(
            this.props.datapoint.dp_defaults[this.state.data_source_content.protocol]
        ));
        let copy_dp_content = JSON.parse(JSON.stringify(this.state.dp_content));
        let counter = this.state.number_rows;
        let number_id = this.state.length_dp_content;
        let new_list_dp = [...copy_dp_content];
        while(counter >= 1) {
            console.log("Valor de this.state.data_source_content.name", this.state.data_source_content.name)
            new_row.table_id = number_id
            new_row.collector_id = this.props.collector.selected.id
            new_row.datasource_name = this.state.data_source_content.name
            new_row.num_type = new_row.num_type.defaultValue
            // if (this.state.data_source_content.protocol === 'Siemens'){
            //     new_row.acess.data.address = new_row.acess.data.address.defaultValue
            // } else if (this.state.data_source_content.protocol === 'Rockwell'){
            //     new_row.acess.data.tag_name = new_row.acess.data.tag_name.defaultValue
            // } else if (this.state.data_source_content.protocol === 'Modbus'){
            //     new_row.acess.data.func_code = new_row.acess.data.func_code.defaultValue
            // } else {}
            new_row.row_state = 'NewRow'
            counter -= 1
            number_id += 1
            new_list_dp.push(new_row)
        }
        console.log("valor de new_list_dp", new_list_dp)
        const newState = {...this.state};
        newState.dp_content = new_list_dp;
        newState.length_dp_content = number_id
        newState.state_popus_cancel = true
        this.setState(newState);
    };

    stateRowsRestore=(params) => {
        if (params.row.row_state === "no_alterations") {
            return(true)
        } else {
            return(false)
        }
    };

    stateRowsDelete=(params) => {
        if (params.row.row_state === "Delete" || params.row.row_state === "errorDelete") {
            return(true)
        } else {
            return(false)
        }
    };

    columnActions=(params) => {
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
        return(component)
    };

    handleBodyComponent=(data_source, header, rows) => {
        let rows_body_component = [];
        rows.forEach((row) =>{
            if (row.datasource_name === data_source.name) {
                rows_body_component.push(row)
            }
        });

        const ele = (
            <Card sx={{flex:'1 1 auto', borderRadius:'0 0 1rem 1rem'}}>
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
        );
        return (ele)
    };

    handleChangeTab=(event, newValue) => {
        let protocol = undefined;
        let options_protocol = [];
        this.state.ds_content_name.forEach((row) =>{
            if (event.target.innerText === row.name) {
                protocol = row.protocol
                if (row.protocol === "Modbus") {
                    options_protocol = JSON.parse(JSON.stringify(
                        this.props.datasource.dp_defaults["Modbus"].acess.data.func_code.menuItems
                    ));
                }
            }
        })
        const newState = {...this.state};
        newState.value = newValue
        newState.data_source_content = {name: event.target.innerText, protocol: protocol}
        newState.options_select = options_protocol
        this.setState(newState);
    };

        /** Description.
    * @param ``: 
    * @returns */
    filterDataSource=(row) => {
        return(row.active && row.collector_id === this.props.collector.selected.id)
    };

    /** Description.
    * @param ``: 
    * @returns */
    filterData=(row) => {
        const ds_name = row.datasource_name
        const ds = this.props.datasource.ds_content.filter(row => row.name === ds_name)[0]
        if (ds) {
            return(row.active && ds.collector_id === this.props.collector.selected.id)
        } else {
            return(false)
        }
    }

    /** Defines the component visualization.
    * @returns JSX syntax element */
    render() {
        const header_siemens = [
            {
                field: 'actions', type: 'actions', cellClassName: 'actions',
                getActions: (params) => this.columnActions(params)
            },
            { field: "name", headerName: "Name", editable: true, flex: 1 },
            { field: "description", headerName: "Description", editable: true, flex: 1 },
            { 
                field: "num_type", headerName: "Num Type", type: 'singleSelect', 
                editable: true, flex: 1, valueOptions: this.state.options_select_num_type,
                valueGetter: (params) => params.row.num_type
            },
            {
                field: "access", headerName: "Access", editable: false, flex: 1,
                valueGetter: (params) => params.row.access.name
            },
        ];

        const header_rockwell = [
            {
                field: 'actions', type: 'actions', cellClassName: 'actions',
                getActions: (params) => this.columnActions(params)
            },
            { field: "name", headerName: "Name", editable: true, flex: 1 },
            { field: "description", headerName: "Description", editable: true, flex: 1 },
            { 
                field: "num_type", headerName: "Num Type", type: 'singleSelect', 
                editable: true, flex: 1, valueOptions: this.state.options_select_num_type,
                valueGetter: (params) => params.row.num_type
            },
            {
                field: "access", headerName: "Access", editable: false, flex: 1,
                valueGetter: (params) => params.row.access.name
            },
        ];

        const header_modbus = [
            {
                field: 'actions', type: 'actions', cellClassName: 'actions',
                getActions: (params) => this.columnActions(params)
            },
            { field: "name", headerName: "Name", editable: true, flex: 1 },
            { field: "description", headerName: "Description", editable: true, flex: 1 },
            { 
                field: "num_type", headerName: "Num Type", type: 'singleSelect', 
                editable: true, flex: 1, valueOptions: this.state.options_select_num_type,
                valueGetter: (params) => params.row.num_type
            },
            {
                field: "access", headerName: "Access", editable: false, flex: 1,
                valueGetter: (params) => params.row.access.name
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
                    variant="scrollable"
                    scrollButtons="auto"
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
                    {this.state.ds_content_name.map((row, index) => (
                        <Tab
                            label={row.name}
                            style={{ zIndex: 1 }}
                        />
                    ))}
                </Tabs>
                {this.state.ds_content_name.map((row, index) => (
                    <CustomTabPanel value={this.state.value} index={index}>
                        {this.handleBodyComponent(
                            row, 
                            header_siemens,
                            this.state.dp_content
                        )}
                    </CustomTabPanel>
                ))}
            </Box>
        );

        const msg_empty = (
            <Stack alignItems='center'>
                <Typography variant='h4'>No Data Source</Typography>
            </Stack>
        );

        let component = null
        if (this.state.ds_content_name.length === 0) {
            component = msg_empty
        } else {
            component = tabs
        }

        const jsx_component = (
            <DialogFullScreen
                open={this.props.OpenDialog}
                title={"Data Point"}
                onOkClick={this.handleOkClickDialog}
                onCancelClick={this.handleCancelClickDialog}
            >
                {component}
                {delete_popup}
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
    onHandleStateEditDp: (state) => dispatch(datapointActions.handleStateEditDp(state)),
    onEditSave: (api, info) => dispatch(datapointActions.putData(api, info)),
    onDeleteDataPoint: (api, dp_name) => dispatch(datapointActions.deleteData(api, dp_name)),
    onNewSave: (api, info) => dispatch(datapointActions.pushData(api, info)),
    onListSaveNew: (api, list) => dispatch(datapointActions.pushListNew(api, list)),
});

// Make this component visible on import
export default connect(reduxStateToProps, reduxDispatchToProps)(DataSourcePopup);