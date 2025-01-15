import React from 'react';
import './ScheduleTable.css';
import {Cell} from './Cell';
import * as Utils from '../../Utils';

export class ScheduleTable extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <>
      <h2>Schedule</h2>
      <table style={{margin: "auto"}}>
        <thead>
          <tr>
            <th></th>
            {
              Utils.days.map((day) => {
                return (
                  <th className="header" key={day+"_header"}>{day}</th>
                )
              })
            }
          </tr>
        </thead>
        <tbody>
          {
            Utils.time.map((hour) => {
              return (
                <tr key={hour+"_body"}>
                  <th className="column">{hour}</th>
                  {
                    Utils.days.map((day) => {
                      var cH = day+hour
                      return (
                        <Cell key={cH} timeRanges={(cH in this.props.timeRanges.timeRangeDataDict) ? this.props.timeRanges.timeRangeDataDict[cH] : []} />
                      )
                    })
                  }
                </tr>
              )
            })
          }
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            {
              Utils.days.map((day) => {
                return (
                  <td className="footer" key={day+"_footer"}></td>
                )
              })
            }
          </tr>
        </tfoot>
      </table>
      </>
    )
  }
}
