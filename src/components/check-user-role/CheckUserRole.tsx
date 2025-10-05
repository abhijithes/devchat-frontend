import React from "react";

const CheckUserRole = ({
  children,
  userRole,
}: {
  children: React.ReactNode;
  userRole?: "member" | "manager" | "owner" | "admin";
}) => {
  if (userRole === "manager" || userRole === "admin" || userRole === "owner") {
    return <>{children}</>;
  }
  return null;
};

export default CheckUserRole;
