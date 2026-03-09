import React, { useState, useEffect } from "react";

function CountdownTimer({ date, time, onStatusChange }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        if (!date || !time) return;

        // Parse appointment date and time to a Date object
        // Assuming date as YYYY-MM-DD and time as HH:MM or HH:MM AM/PM
        // To handle general cases, let's create a valid datetime string
        // It's safer if we can construct it properly.

        // Convert time to 24h format if it's in 12h format
        let timeStr = time;
        if (time.toLowerCase().includes('m')) {
            // It has AM/PM
            const [timePart, modifier] = time.split(' ');
            let [hours, minutes] = timePart.split(':');
            if (hours === '12') hours = '00';
            if (modifier.toUpperCase() === 'PM') hours = parseInt(hours, 10) + 12;
            timeStr = `${hours.toString().padStart(2, '0')}:${minutes}:00`;
        } else if (time.split(':').length === 2) {
            timeStr = `${time}:00`;
        }

        const appointmentDateTime = new Date(`${date}T${timeStr}`);

        const intervalId = setInterval(() => {
            const now = new Date();
            const difference = appointmentDateTime - now;

            if (difference > 300000) { // > 5 minutes before
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                let display = "";
                if (days > 0) display += `${days}d `;
                display += `${hours}h ${minutes}m ${seconds}s`;
                setTimeLeft(`Starts in: ${display}`);
                if (onStatusChange) onStatusChange(false);
            } else if (difference <= 300000 && difference > -3600000) { // Within 5 mins before, up to 1 hr after
                setTimeLeft("Ready to join");
                if (onStatusChange) onStatusChange(true);
            } else {
                setTimeLeft("Past appointment");
                if (onStatusChange) onStatusChange(false);
                clearInterval(intervalId);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [date, time, onStatusChange]);

    if (!timeLeft) return null;

    return (
        <div style={{ fontSize: "0.85rem", color: timeLeft === "Ready to join" ? "#28a745" : "#e53e3e", fontWeight: "600", marginTop: "4px" }}>
            {timeLeft}
        </div>
    );
}

export default CountdownTimer;
