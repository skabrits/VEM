import React from 'react';
import './DisplayItem.css';
import { ItemRaw } from './ItemRaw';
import * as Common from './Common';
import * as GCommon from 'src/Common';

export class DisplayItem extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      items: []
    };
    this.processData = this.processData.bind(this);
    this.loadData = this.loadData.bind(this);
  }

  processData(data) {
    if (data.status === 200) {
      this.setState({
        isLoaded: true,
        items: data.data
      });
    } else {
      console.error(data.message)
      this.setState({
        isLoaded: false,
        items: []
      });
    }
  }

  loadData() {
    GCommon.Api.fetchApiResource(Common.typeProperties[this.props.type].endpoint, { callbackOnSuccessLoad: this.processData })
  }

  componentDidMount() {
    this.loadData()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isLoaded !== true) {
      this.loadData()
    }
  }

  render() {
    return (
      <>
      <h2>{Common.typeProperties[this.props.type].header}</h2>
      <div className="scrollable-table">
        {
          this.state.items.map((item) => {
            return (
              <ItemRaw key={item.id} resource={item.id} type={this.props.type} name={item.name} status={item.status} />
            )
          })
        }
      </div>
      </>
    )
  }
}
