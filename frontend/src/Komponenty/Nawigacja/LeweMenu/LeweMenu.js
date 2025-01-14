import React from 'react'
import "./LeweMenu.css";
import { DaneMenu } from './DaneMenu'

function LeweMenu() {
  return (
    <div className='LeweMenu'>
      <div className="Menu">
        <ul className='MenuList'>
          {DaneMenu.map((val, key) => {
            return (
              <li
                key={key}
                className="row"
                id={window.location.pathname === val.link ? "active" : ""}
                onClick={() => { window.location.pathname = val.link }}>
                <div className='tytulStrony'>{val.title}</div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default LeweMenu


