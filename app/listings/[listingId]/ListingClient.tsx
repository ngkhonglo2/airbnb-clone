'use client'

import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { SafeListing, SafeReservation, SafeUser } from "@/app/types";
import { categories } from "@/app/components/navbar/Categories";
import Container from "@/app/components/Container";
import ListingHead from "@/app/components/listings/ListingHead";
import ListingInfo from "@/app/components/listings/ListingInfo";

import useLoginModal from "@/app/hooks/useLoginModal";
import axios from "axios";
import { toast } from "react-hot-toast";
import ListingReservation from "@/app/components/listings/ListingReservation";
import { Range } from "react-date-range";

const intialDateRange = {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
}

interface ListingClientProps {
    reservartions?: SafeReservation[]
    listing: SafeListing & {
        user: SafeUser
    },
    currentUser?: SafeUser | null
}

const ListingClient: React.FC<ListingClientProps> = ({
    listing,
    reservartions = [],
    currentUser
}) => {
    const loginModal = useLoginModal()
    const router = useRouter()

    const disableDates = useMemo(() => {
        let dates: Date[] = [];

        reservartions.forEach((reservartion) => {
            const range = eachDayOfInterval({
                start: new Date(reservartion.startDate),
                end: new Date(reservartion.endDate)
            })

            dates = [...dates, ...range]
        })
        
        return dates
    }, [reservartions])

    const [isLoading, setIsLoading] = useState(false);
    const [totalPrice, setTotalPrice] = useState(listing.price)
    const [dateRange, setDateRange] = useState<Range>(intialDateRange)

    const onCreateReservation = useCallback(() => {
        if(!currentUser) {
            return loginModal.onOpen()
        }

        setIsLoading(true)

        axios.post('/api/reservations', {
            totalPrice,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            listingId: listing?.id
        })
        .then(() => {
            toast.success('Listing reserved!')
            setDateRange(intialDateRange)
            // Redirect to/trips
            router.push('/trips');
        })
        .catch(() => {
            toast.error('Something went wrong.')
        })
        .finally(() => {
            setIsLoading(false)
        })
    }, [
        totalPrice,
        dateRange,
        listing?.id,
        router,
        currentUser,
        loginModal
    ])

    useEffect(() => {
        if (dateRange.startDate && dateRange.endDate) {
            const dayCount = differenceInCalendarDays(
                dateRange.endDate,
                dateRange.startDate
            )

            if(dayCount && listing.price) {
                setTotalPrice(dayCount * listing.price)
            } else {
                setTotalPrice(listing.price)
            }
        }
    }, [dateRange, listing.price])

    const category = useMemo(() => {
        return categories.find((item) => item.label === listing.categoty)
    }, [listing.categoty])
    
    return (
        <Container>
            <div className="max-w-screen-lg mx-auto">
                <div className="flex flex-col gap-6">
                    <ListingHead
                        title={listing.title}
                        imageSrc={listing.imageSrc}
                        locationValue={listing.locationValue}
                        id={listing.id}
                        currentUser={currentUser}
                    />
                    <div className="grid grid-cols-1 mt-6 md:grid-cols-7 md:gap-10">
                        <ListingInfo
                            user={listing.user}
                            category={category}
                            description={listing.description}
                            roomCount={listing.roomCount}
                            guestCount={listing.guestCount}
                            bathroomCount={listing.bathroomCount}
                            locationValue={listing.locationValue}
                        />
                        <div
                            className="order-first mb-10 md:order-last md:col-span-3"
                        >
                            <ListingReservation
                                price={listing.price}
                                totalPrice={totalPrice}
                                onChangeDate={(value) => setDateRange(value)}
                                dateRange={dateRange}
                                onSubmit={onCreateReservation}
                                disabled={isLoading}
                                disabledDates={disableDates}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default ListingClient;