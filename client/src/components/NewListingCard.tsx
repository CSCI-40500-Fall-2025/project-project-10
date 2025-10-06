import { Card, CardMedia, CardContent, Typography } from "@mui/material";
import type { Listing } from "../types";

export function ListingCard( {listing} : {listing: Listing}) {
    return (
        <Card sx={{width: "400px", height: "325px", borderRadius: "25px"}}>
            <CardMedia sx={{height : 200}} image={listing.imageUrl} title="Listing Image"/>
            <CardContent sx={{height: 125, textAlign: "left"}}>
                <Typography variant="body2">{listing.city}</Typography>
                <Typography variant="h6">{listing.title}</Typography>
                <Typography variant="subtitle2">{`$${listing.price} / month`}</Typography>            
            </CardContent>
        </Card>
    )
}