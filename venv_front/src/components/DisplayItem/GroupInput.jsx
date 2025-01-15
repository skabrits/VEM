import React from 'react';
import './GroupInput.css';
import * as Utils from '../../Utils';
import * as Configs from '../../Configs';

function genTimeRange() {
  var tR = [
    {
      day: 1,
      startTime: 195,
      duration: 90,
      group: "phys"
    },
    {
      day: 5,
      startTime: 345,
      duration: 90,
      group: "phys"
    },
    {
      day: 3,
      startTime: 360,
      duration: 45,
      group: "mat"
    }
  ]

  return new Utils.TimeRangeDataList(tR.map((e) => new Utils.TimeRangeData(e)))
}

export class GroupInput extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}
    this.search = this.search.bind(this);
  }

  componentDidMount() {
    fetch(Configs.backUrl + Configs.groupService).then((response) => {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    }).then((data) => {

    }).catch((response) => {
      console.log(response.status, response.statusText);
      response.json().then((json: any) => {
        console.log(json);
      });
    });
  }

  search(e) {
    if(e.key === 'Enter') {
      this.props.setTimeRanges(genTimeRange())
    }
  }

  render() {
    return (
      <>
      <input type="text" onKeyDown={this.search}/>
      </>
    )
  }
}
