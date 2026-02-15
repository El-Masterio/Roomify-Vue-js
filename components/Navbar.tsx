import React from 'react';
import {Box} from "lucide-react";
import Button from "./ui/Button";
import {useOutletContext} from "react-router";

const Navbar = () => {
   const {isSignedIn, userName, signIn, signOut} = useOutletContext<AuthContext>();
    const handleAuthClick = async () => {
        if (isSignedIn) {
            try{
                await signOut();
            }catch(err){
                console.log(`puter Sign out failed: ${err}`);
            }
            return;
        }

        try{
            await signIn();
        }catch(err){
            console.log(`puter Sign out failed: ${err}`);
        }
    };
    return (
        <header className="navbar">
            <nav className="inner">
                <div className="left">
                    <div className="brand">
                        <Box className="logo"/>

                        <span className="Name">
                            Roomify
                        </span>
                    </div>

                    <ul className="links">
                        <a href="#">Product</a>
                        <a href="#">Pricing</a>
                        <a href="#">Community</a>
                        <a href="#">Enterprise</a>

                    </ul>
                </div>
                <div className="actions">
                    {isSignedIn ? (
                        <>
                        <span className="greeting">
                            {userName? `HI, ${userName}`: 'Signed in' }
                        </span>
                            <Button size="sm" onClick={handleAuthClick} className="btn">
                                Log out
                            </Button>
                        </>
                        ):(
                        <>
                        <Button onClick={handleAuthClick} size="sm" variant="ghost">
                            Log In
                        </Button>
                         <a href="#upload" className="cta"> Get Started</a>
                        </>
                    )}

                </div>
            </nav>
        </header>
    );
};

export default Navbar;