import React from 'react'
import { useParams } from 'react-router-dom';
import { Box, Typography, Rating, Divider, Chip, useTheme, useMediaQuery, Button, Paper } from '@mui/material';

import { BACKEND_URL } from '../helper/getLinks';
import fetchObject from '../helper/fetchObject';
import ImageListDisplay from '../components/ImageListDisplay';
import { getUserRating } from '../helper/helperFuncs';
// import BedListDisplay from '../components/BedListDisplay';

export default function ListingDetailPage (props) {
  const [listingInfo, setListingInfo] = React.useState([]);
  const [bookingInfo, setBookingInfo] = React.useState(null);
  const [diffDate, setDiffDate] = React.useState(-1);

  console.log(props)
  const { listingId } = useParams();
  console.log(listingId);

  React.useEffect(() => {
    getListingInfo();
    getBookings();
    console.log(props.currentPage, props.searchDateRange.length)
    if (props.currentPage === 'search' && props.searchDateRange.length === 2) {
      setDiffDate(props.searchDateRange[1].diff(props.searchDateRange[0], 'day') - 1)
    }
    props.setCurrentPage('listing');
  }, []);

  const getListingInfo = async () => {
    const response = await fetch(`${BACKEND_URL}/listings/${listingId}`, fetchObject('GET', {}, false));
    const data = await response.json();
    if (data.error) {
      props.setErrorModalMsg(data.error);
      props.setErrorModalShow(true);
    } else {
      setListingInfo(data.listing);
      console.log(listingInfo);
    }
  }

  const getBookings = async () => {
    const response = await fetch(`${BACKEND_URL}/bookings`, fetchObject('GET', {}, true));
    const data = await response.json();
    if (data.error) {
      props.setErrorModalMsg(data.error);
      props.setErrorModalShow(true);
    } else {
      let bookings = data.bookings;
      if (bookings) {
        bookings = bookings.filter(booking => (
          booking.listingId === listingId && booking.owner === localStorage.getItem('userEmail')
        ))[0];
        bookings && setBookingInfo(bookings);
      }
    }
  }

  const [userRating, reviewLength] = getUserRating(listingInfo.reviews);

  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.up('md')); // Medium devices and up (laptops/desktops)
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // Small to medium devices (tablets)
  const isPhone = useMediaQuery(theme.breakpoints.down('sm')); // Small devices (phones)

  let amenityHeight;
  if (isLaptop) {
    amenityHeight = '10vw'; // Adjust as needed for laptops/desktops
  } else if (isTablet) {
    amenityHeight = '20vw'; // Adjust as needed for tablets
  } else if (isPhone) {
    amenityHeight = '30vw'; // Adjust as needed for phones
  }

  if (!listingInfo || listingInfo.length === 0) {
    return <>Loading...</>;
  } else {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        margin: '1vw',
      }}>
        <ImageListDisplay />
        {/* Content */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          margin: '2vw',
          justifyContent: 'space-between'
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifySelf: 'flex-start',
          }}>
            <Typography variant='h4'>{ listingInfo.title }</Typography>
            <Typography variant='h6' fontWeight={1}>
              { Object.values(listingInfo.address).join(', ') }
            </Typography>
            {diffDate <= 0
              ? (<Typography variant='h6' sx={{ textDecoration: 'underline' }}>
                  ${parseFloat(listingInfo.price)}/night
                </Typography>)
              : (<Typography variant='h6' sx={{ textDecoration: 'underline' }}>
                  ${diffDate * parseFloat(listingInfo.price)}/stay
                </Typography>)}
            {reviewLength === 0
              ? (<Typography variant='subtitle2'> No Reviews </Typography>)
              : (<>
                <Rating name="user-rating" defaultValue={userRating} precision={0.1} readOnly />
                <Typography variant='subtitle2'>{reviewLength} reviews</Typography>
              </>)}
            <Divider>
              <Chip label="ROOMS" />
            </Divider>
            <Typography variant='subtitle2'>
              No. of Beds: {listingInfo.metadata.numberOfBeds}
            </Typography>
            <Typography variant='subtitle2'>
              No. of Baths: {listingInfo.metadata.numberOfBathrooms}
            </Typography>
            {/* <BedListDisplay bedrooms={listingInfo.metadata.rooms} /> */}
            <Divider>
              <Chip label="AMENITIES" />
            </Divider>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              flexWrap: 'wrap',
              height: { amenityHeight },
            }}>
              {listingInfo.metadata.amenities.map((amenity, index) => (
                <Typography variant='subtitle1' key={index}>
                  {amenity}
                </Typography>
              ))}
            </Box>
          </Box>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
          >
            <Button variant="contained" sx={{
              display: 'flex',
              height: 'min-content',
              width: 'auto',
              justifySelf: 'flex-start',
            }} >Book</Button>
            {bookingInfo &&
                <Paper
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography>
                    Booking Date: {Object.values(bookingInfo.dataRange).join(' - ')}
                  </Typography>
                  {bookingInfo.status === 'accepted'
                    ? <Chip label="Accepted" color="success" />
                    : <Chip label="Pending" color="warning" />}
                </Paper>
            }
          </Box>
        </Box>
      </Box>
    );
  }
}
