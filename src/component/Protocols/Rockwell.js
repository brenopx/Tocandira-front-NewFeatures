/** This module contains the functions to
 * return the components used for ROCKWELL CIP
 * protocol
 * 
 * Copyright (c) 2017 Aimirim STI.
*/

// Imports from modules
import { TextField, Stack } from "@mui/material";

// Local Imports
import SimpleSelect from "../SimpleSelect/SimpleSelect";
import {getDataPointAddress} from "../Protocols/Protocols";

// #######################################


class Rockwell {

    /** Description.
    * @param ``: 
    * @returns */
    static dataSourceFields=(events,values,defaults) => {
        const comp_list = 
        <Stack direction="column" spacing='1rem'>
            <TextField variant="outlined" label="Name" type='text' required
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={values.name}
                placeholder={defaults.name}
                onChange={events.onNameChange}
                sx={{marginBottom:'1rem'}}>
            </TextField>
            <Stack direction="row" spacing="1rem">
                <TextField variant="outlined" label="IP Address" type='text' required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={values.plc_ip}
                    placeholder={defaults.plc_ip}
                    onChange={events.onIpChange}>
                </TextField>
                <TextField variant="outlined" label="Port" type='tel' required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={values.plc_port.toString()}
                    placeholder={defaults.plc_port.toString()}
                    onChange={events.onPortChange}>
                </TextField>
            </Stack>
            <Stack direction="row" spacing="1rem">
                <TextField variant="outlined" label="Slot" type='number' required
                    InputLabelProps={{ shrink: true }}
                    value={values.protocol.data.slot}
                    placeholder={defaults.protocol.data.slot}
                    onChange={events.onSlotChange}>
                </TextField>
                <SimpleSelect
                    fullWidth
                    label={"Network Type"}
                    list={defaults.protocol.data.connection.menuItems}
                    value={values.protocol.data.connection}
                    defaultValue={defaults.protocol.data.connection.defaultValue}/>
            </Stack>
            <TextField variant="outlined" label="Path" type='text' required
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={values.protocol.data.path}
                placeholder={defaults.protocol.data.path}
                onChange={events.onPathChange}>
            </TextField>
        </Stack>
        return(comp_list);
    }

    /** Description.
    * @param ``: 
    * @returns */
    static dataPointFields=(events,values,defaults) => {
        const comp_list = 
        <Stack direction="column" spacing='1rem'>
            <TextField variant="outlined" label="Name" type='text' required
                fullWidth
                value={values.name}
                placeholder={defaults.name}
                onChange={events.onNameChange}>
            </TextField>
            <TextField variant="outlined" label="Description" type='text' required
                fullWidth
                value={values.description}
                placeholder={defaults.description}
                onChange={events.onDescriptionChange}>
            </TextField>
            <TextField variant="outlined" label="Address" type='text' required
                fullWidth
                value={getDataPointAddress(values,values.access.name)}
                placeholder={getDataPointAddress(defaults,defaults.access.name)}
                onChange={events.onAddressChange}>
            </TextField>
        </Stack>
        return(comp_list);
    }
}

export default Rockwell;