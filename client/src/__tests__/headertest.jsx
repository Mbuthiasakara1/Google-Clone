// import React from "react";
// import { render, screen, fireEvent } from "@testing-library/react";
// import "@testing-library/jest-dom";
// import Header from "../components/Header";

// describe("Header Component", () => {
//   test("renders logo, search input, and avatar icon", () => {
//     render(<Header toggleTheme={() => {}} />);

   
//     expect(screen.getByAltText("Google Drive")).toBeInTheDocument();
//     expect(screen.getByText("Drive")).toBeInTheDocument();

    
//     expect(screen.getByPlaceholderText("Search in Drive")).toBeInTheDocument();

   
//     expect(screen.getByRole("img")).toBeInTheDocument();
//   });

//   test("opens avatar form when avatar icon is clicked", () => {
//     render(<Header toggleTheme={() => {}} />);

    
//     fireEvent.click(screen.getByRole("img"));

   
//     expect(screen.getByText("Upload Avatar")).toBeInTheDocument();
//   });
// });
