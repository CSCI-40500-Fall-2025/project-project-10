import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { lightBlue } from '@mui/material/colors';
import debounce from "lodash/debounce";

type LocationRecsProps = {
    location: string;
}

export default function LocationRecs({ location }: LocationRecsProps) {
    const [locationInfo, setLocationInfo] = useState<string>('Getting fun stuff...'); 
    const API_URL = process.env.VITE_API_URL as string | undefined ?? import.meta.env.VITE_API_URL as string | undefined

    useEffect(() => {
        if (location.length === 0) {
            setLocationInfo('Please select a city for fun sites.');
            return;
        }

        const getLocationInfo = async () => {
            try {
                setLocationInfo('Getting fun stuff...')
                const response = await fetch(`${API_URL}/locationInfo`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 'location': location }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch fun stuff');
                }

                const data = await response.json();
                setLocationInfo(data.recommendations);
            } catch (error) {
                console.error(error);
                setLocationInfo('Could not load recommendation.');
            }
        };

        debounce(getLocationInfo, 2000)();
    }, [location, API_URL]);


    return (
        <Box>
            <Box sx={{display: "flex", flexDirection : "col", justifyContent: "center", mt: "24px",width: 400, height: 50, padding: "16px 24px", backgroundColor: lightBlue['A400'], borderRadius: "25px 25px 0 0"}}>
                <Typography variant="h4" sx={{color: "white"}}>Things to do</Typography>
            </Box>

            <Box sx={{mt: "0",width: 400, height: 300, padding: "16px 24px", backgroundColor: "white", borderRadius: "0 0 25px 25px"}}>

                {locationInfo.split("*").map((text) => text.length > 0 && <Typography variant="h5" sx={{color: "black"}}>{`- ${text}`}</Typography>)}
            </Box>
        </Box>
    )
}