import React from 'react';
import './Cell.css';
import * as Utils from '../../Utils';
import {TimeRange} from './TimeRange';


//         <div style={{display: "block", position: "absolute", top: "0", left: "10"}}>
//         <TimeRange minutes="60" color="purple" />
//       </div>

export class Cell extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <td className="body">
        {
          this.props.timeRanges.map((timeRangeData, index) => {
            return (
              <div key={index} style={{display: "block", position: "absolute", top: 50+(~~(100*(timeRangeData.startTime - Utils.minutes2hours(timeRangeData.startTime)*60) / 60))+"%", left: "0", width: "fit-content", height: "fit-content"}}>
                <TimeRange minutes={timeRangeData.duration} color={timeRangeData.color} />
              </div>
            )
          })
        }
      </td>
    )
  }
}
