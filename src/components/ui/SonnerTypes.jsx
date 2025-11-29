"use client";

import React from "react";
import { toast } from "./sonner";
import { Button } from "../button";

export function SonnerTypes() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button label="Default" onClick={() => toast("Event has been created")} />
      <Button
        label="Success"
        onClick={() => toast.success("Event has been created")}
      />
      <Button
        label="Info"
        onClick={() =>
          toast.info("Be at the area 10 minutes before the event time")
        }
      />
      <Button
        label="Warning"
        onClick={() =>
          toast.warning("Event start time cannot be earlier than 8am")
        }
      />
      <Button
        label="Error"
        onClick={() => toast.error("Event has not been created")}
      />
      <Button
        label="Promise"
        onClick={() => {
          toast.promise(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve({ name: "Event" }), 2000)
              ),
            {
              loading: "Loading...",
              success: (data) => `${data.name} has been created`,
              error: "Error",
            }
          );
        }}
      />
    </div>
  );
}

export default SonnerTypes;
