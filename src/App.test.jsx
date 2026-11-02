import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App Component", () => {
  test("renders without crashing", () => {
    render(<App />);
    expect(screen.getByText(/Meridian Logistics Pte Ltd/i)).toBeInTheDocument();
  });

  test("displays partner information correctly", () => {
    render(<App />);
    expect(screen.getByText(/Northfield Industrial Supply/i)).toBeInTheDocument();
    expect(screen.getByText(/12 Shenton Way, #08-01/i)).toBeInTheDocument();
  });

  test("handles empty partner list gracefully", () => {
    const emptyPartners = [];
    render(<App partners={emptyPartners} />);
    expect(screen.getByText(/No partners available/i)).toBeInTheDocument();
  });

  test("displays customer information correctly", () => {
    render(<App />);
    expect(screen.getByText(/Altair Manufacturing Co./i)).toBeInTheDocument();
    expect(screen.getByText(/88 Jurong East Ave 1/i)).toBeInTheDocument();
  });

  test("handles empty customer list gracefully", () => {
    const emptyCustomers = [];
    render(<App customers={emptyCustomers} />);
    expect(screen.getByText(/No customers available/i)).toBeInTheDocument();
  });

  test("displays rental information correctly", () => {
    render(<App />);
    expect(screen.getByText(/RNT-20441/i)).toBeInTheDocument();
    expect(screen.getByText(/Active/i)).toBeInTheDocument();
  });

  test("handles empty rental list gracefully", () => {
    const emptyRentals = [];
    render(<App rentals={emptyRentals} />);
    expect(screen.getByText(/No rentals available/i)).toBeInTheDocument();
  });

  test("displays installation information correctly", () => {
    render(<App />);
    expect(screen.getByText(/AX-220 Air Dryer/i)).toBeInTheDocument();
    expect(screen.getByText(/Haris/i)).toBeInTheDocument();
  });

  test("handles empty installation list gracefully", () => {
    const emptyInstallations = [];
    render(<App installations={emptyInstallations} />);
    expect(screen.getByText(/No installations available/i)).toBeInTheDocument();
  });
});
