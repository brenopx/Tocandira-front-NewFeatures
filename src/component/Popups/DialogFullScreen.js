/** This module holds the view of the React
 * component `FormPopup`
 * 
 * Copyright (c) 2017 Aimirim STI.
 * 
 * Dependencies are:
 * - react 
*/

// Imports from modules;
import React from 'react';
import PropTypes from 'prop-types';
import { AppBar, Button, Dialog, DialogContent,
    IconButton, Slide, Toolbar, Tooltip, Typography } from '@mui/material';
import {Close} from '@mui/icons-material';
// Local Imports

// #######################################


/** Description
 * @property ``
 * @returns */
function downAnimationFunction (props, ref) {
// HACK: This function needs to be external to the class 
//       that use this animation. Reason is unknown for me,
//       but the behaviour and the solution can be found in:
//       https://github.com/mui/material-ui/issues/9116
    return <Slide direction='down' ref={ref} {...props} />;
}
// This constant also needs to be outside the class component
const down_animation = React.forwardRef(downAnimationFunction);

/** Description
* @property `props.`:
* @method `props.`: */
class DialogFullScreen extends React.PureComponent {
    
    // /** Defines the component property types */
    static propTypes = {
        open: PropTypes.bool,
        title: PropTypes.string,
        nameOk: PropTypes.string,
        nameCancel: PropTypes.string,
        onOkClick: PropTypes.func,
        onCancelClick: PropTypes.func,
        contentProps: PropTypes.object,
    };

    static defaultProps = {
        nameOk:'SAVE',
        nameCancel:'CANCEL',
    }
    /** Defines the component visualization.
    * @returns JSX syntax element */
    render(){       
        const jsx_component = (
                <Dialog fullScreen open={this.props.open} scroll='paper' fullWidth maxWidth={this.props.cardWidth}
                    TransitionComponent={down_animation} PaperProps={{sx:{alignSelf:'flex-start', backgroundColor: '#eee'}}}>
                    <AppBar sx={{ position: 'relative' }}>
                        <Toolbar>
                            <Tooltip title={this.props.nameCancel} followCursor disableInteractive>
                                <IconButton edge="start"
                                    onClick={this.props.onCancelClick} color="inherit"
                                >
                                    <Close fontSize='large'/>
                                </IconButton>
                            </Tooltip>
                            <Typography sx={{ ml: 2, flex: 1 }} variant="h4" component="div">
                                {this.props.title}
                            </Typography>
                            <Button  sx={{ fontSize: '20px' }} color="inherit" variant='text'  
                                size='large' onClick={this.props.onOkClick}>
                                {this.props.nameOk}
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <DialogContent sx={this.props.contentProps}>
                        {this.props.children}
                    </DialogContent>
            </Dialog>
        );
        return(jsx_component);
    }
    
}

// Make this component visible on import
export default DialogFullScreen;