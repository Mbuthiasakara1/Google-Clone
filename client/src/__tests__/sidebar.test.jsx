import React from "react"
import Sidebar from "../components/Sidebar"
import {render, screen, fireEvent} from '@testing-library/react'

jest.spyOn(console, "log")
describe("Sidebar",()=>{
    it("checks if there's a function Sidebar",()=>{
        expect(typeof Sidebar).toBe("function")
    })
    it("renders 'New' button", () => {
        render(<Sidebar />)
        const newbtn = screen.getByRole("button",{
            name: /new/i
        })
        expect(newbtn).toBeInTheDocument();
      });
      
    it("renders sidebar options when 'New' button is clicked", ()=>{
        render(<Sidebar />)
        const newbtn = screen.getByRole("button",{
            name: /new/i
        })
        fireEvent.click(newbtn)
        const createfolder = screen.getByText(/create folder/i)
        const uploadfile = screen.getByText(/upload file/i)
        const uploadfolder = screen.getByText(/upload folder/i)

        expect(createfolder).toBeInTheDocument();
        expect(uploadfolder).toBeInTheDocument();
        expect(uploadfile).toBeInTheDocument();
      });

      test("shows and hides the 'Create Folder' form", () => {
        render(<Sidebar />)
       // Click 'New' button to open the dropdown
       const newbtn = screen.getByRole("button",{
        name: /new/i
        })
        fireEvent.click(newbtn)
        
        // Click 'Create Folder' to open the form
        fireEvent.click(screen.getByText(/Create Folder/i));

        // Verify the form is visible
        expect(screen.getByLabelText(/New Folder/i)).toBeInTheDocument();

        // Click 'Cancel' to close the form
        fireEvent.click(screen.getByText(/Cancel/i));
        expect(screen.queryByLabelText(/New Folder/i)).not.toBeInTheDocument();
        });

        test("submits 'Create Folder' form", () => {
        render(<Sidebar />)    
        fireEvent.click(screen.getByRole("button", { name: /new/i }));

        fireEvent.click(screen.getByText(/Create Folder/i));

        const folderInput = screen.getByLabelText(/New Folder/i);
        // expect(folderInput).toBeInTheDocument()
        fireEvent.change(folderInput, { target: { value: "folderName" } });
        // fireEvent.change(input, { target: { value: "folderName" } });
        // fireEvent.click(screen.getByRole("button", { name: /Create/i }));

        expect(console.log).toHaveBeenCalledWith("Folder Name:", "folderName");
        // expect(screen.getByLabelText(/New Folder/i).value).toBe("");
    });


        test("checks if Home is in document", ()=>{
            render(<Sidebar />)
            const home = screen.getByText(/Home/i)
            expect(home).toBeInTheDocument();
            // fireEvent.click(screen.getByText(/Home/i))
            // expect(screen.getByText(/Home/i)).toBeInTheDocument();
        })
        test("checks if 'My Drive is in document",()=>{
            render(<Sidebar />)
            const myDrive = screen.getByText(/My Drive/i)
            expect(myDrive).toBeInTheDocument();
            // fireEvent.click(screen.getByText(/My Drive/i))
            // expect(screen.getByText(/My Drive/i)).toBeInTheDocument();
        })
        
    
})
