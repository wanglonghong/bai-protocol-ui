import React, { useState, useEffect, useRef } from "react";

import styled from 'styled-components'

const StyledDropDown = styled.div`
    position:relative;
		width: 30%;
`
const StyledDropDownDiv = styled.div`
    display: flex;
    flex-direction: column;
    z-index: 9999;
		color: white;
    padding: 5px;
    top: 45px;
    position:absolute;
    border-radius:3px;
    background: var(--color-bg-primary);    
    display: ${({ hide }) => (hide ? 'block' : 'none')};
    width:100%;
		max-height: 200px;
		overflow: auto;
`
const StyledDropDownHeader = styled.div`
    color:white;
    padding: 5px;
    border-radius:3px;
    text-align: left;
		font-weight: bold;
		display: flex;
		align-items: center;
		img{
			height: 28px;
			margin-right: 12px;
		}
    :after{
		border: 2px solid white;
		border-radius: 2px;
		border-right: 0;
		border-top: 0;
		content: " ";
		display: block;
		margin-top: -.5em;
		pointer-events: none;
		position: absolute;
		top: 50%;
		transform: rotate(-45deg);
		transform-origin: center;
		height: .625em;
		width: .625em;
		right: 1.125em;
		transition: border-color .15s ease-in-out;
	}
`

const StyledDropDownItemDiv = styled.div`
    padding: 0.3rem;
    text-align: left;
		font-size: 0.9rem;
		font-weight: bold;
		display: flex;
		align-items: center;
		img{
			height: 28px;
			margin-right: 12px;
		}
    ${({ isSelect }) => !isSelect && `
        :hover{
            background-color: var(--color-bg-active); 
        }
    `}
    ${({ isSelect }) => isSelect && `
        
			background-color: var(--color-bg-primary);
            color: var(--color-text-main);
        
    `}
`
const DropDownMenu = ({ list, current, setCurrent, small }) => {
	const [hide, setHide] = useState(false)
	const dropMenuRef = useRef(null);

	const handleClickOutside = (e) => {
		if (dropMenuRef.current && dropMenuRef.current.contains(e.target)) {
			return;
		}
		setHide(false);
	};

	useEffect(() => {
		if (hide) {
			document.addEventListener('mousedown', handleClickOutside);
		} else {
			document.removeEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [hide]);

	return (
		<StyledDropDown>
			<StyledDropDownHeader className={hide === true ? 'show-dropdown' : ''} hide={hide} onClick={() => setHide(!hide)} small={small}>
				{current.label}
			</StyledDropDownHeader>
			<StyledDropDownDiv ref={dropMenuRef} hide={hide}>
				{list.map((item, index) => {
					return (
						<StyledDropDownItemDiv isSelect={current.id === item.id} small={small} key={`__key-${index.toString()}`} onClick={() => {
							setHide(false)
							setCurrent(item)
						}
						}>
							{item.label}
						</StyledDropDownItemDiv>
					)
				})}

			</StyledDropDownDiv>
		</StyledDropDown>
	)
}
export default DropDownMenu