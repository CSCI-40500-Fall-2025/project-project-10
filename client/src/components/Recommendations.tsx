import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { lightBlue } from '@mui/material/colors';
import type { Listing } from "../types";

type RecommendationsProps = {
    listings: Listing[];
}

export default function Recommendations({ listings }: RecommendationsProps) {
    const [recommendation, setRecommendation] = useState<string>('Generating recommendation...');
    const API_URL = process.env.VITE_API_URL as string | undefined ?? import.meta.env.VITE_API_URL as string | undefined

    useEffect(() => {
        if (listings.length === 0) {
            setRecommendation('Not enough data to make a recommendation.');
            return;
        }

        const getRecommendation = async () => {
            try {
                const response = await fetch(`${API_URL}/recommendations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ listings }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch recommendation');
                }

                const data = await response.json();
                setRecommendation(data.recommendation);
            } catch (error) {
                console.error(error);
                setRecommendation('Could not load recommendation.');
            }
        };

        getRecommendation();
    }, [listings, API_URL]);


    return (
        <Box>
            <Box sx={{display: "flex", flexDirection : "col", justifyContent: "center", mt: "24px",width: 400, height: 50, padding: "16px 24px", backgroundColor: lightBlue['A400'], borderRadius: "25px 25px 0 0"}}>
                <Typography variant="h4" sx={{color: "white"}}>Our Recommendations</Typography>
            </Box>

            <Box sx={{mt: "0",width: 400, height: 300, padding: "16px 24px", backgroundColor: "white", borderRadius: "0 0 25px 25px"}}>
                <Typography variant="h5" sx={{color: "black"}}>{recommendation}</Typography>
            </Box>
        </Box>
    )
}