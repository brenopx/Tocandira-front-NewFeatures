/** This module holds the view of the React
 * component `TitledCard`
 * 
 * Copyright (c) 2017 Aimirim STI.
 * 
 * Dependencies are:
 * - react 
 * - @mui/material
*/

// Imports from modules;
import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Grid, IconButton, Stack, Typography } from '@mui/material';
// #######################################

/** Description
* @property `props.`:
* @method `props.`: */
class TitledCard extends React.PureComponent {
    
    /** Defines the component property types */
    static propTypes = {
        title: PropTypes.string,
        contents: PropTypes.arrayOf(PropTypes.object),
        cardprops: PropTypes.object,
        title_icon: PropTypes.object,
    };
    
    /** Recieves a content and add it to the card grid
     * @param content: A JSX component. */
    buildContent=(content,index)=>(
        <Grid item key={index}>
            {content}
        </Grid>
    )

    /** Defines the component visualization.
    * @returns JSX syntax element */
    render(){
        let icon = null
        if(this.props.title_icon){        
            icon = (<IconButton variant="contained" size="large" onClick={this.props.handleClickIcon}>
                    {this.props.title_icon}
                </IconButton>)
        }

        const jsx_component = (
            <Card sx={{...this.props.cardprops, borderRadius:'1rem'}}>
                <CardContent sx={{padding:'1rem 2rem'}}>
                <Grid container spacing='1rem' direction="column" alignItems="stretch">
                    <Grid item>
                        <Stack direction='row' alignItems='center'>
                            <Typography variant='h5' align='left' color='text.secondary'>
                                {this.props.title}
                            </Typography>
                            {icon}
                        </Stack>
                    </Grid>
                    {this.props.contents.map(this.buildContent)}
                </Grid>
                </CardContent>
            </Card>
        );
        return(jsx_component);
    }
    
}

// Make this component visible on import
export default TitledCard;