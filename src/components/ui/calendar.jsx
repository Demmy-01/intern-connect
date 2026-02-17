import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

export function Calendar({ className, ...props }) {
    return (
        <DayPicker
            showOutsideDays={true}
            className={className}
            captionLayout="dropdown"
            {...props}
        />
    );
}
