import React from 'react';
import './DisplayItem.css';
import { ItemRaw } from './ItemRaw';
import * as Common from './Common';
import * as GCommon from 'src/Common';
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function NewResource(props) {
  const navigate = useNavigate();
  return <div className="add-item" onClick={(e) => navigate(`/editor/${Common.typeProperties[props.resource].name}`)}><div className="icon-container"><FaPlus size={15} /></div></div>
}

export class DisplayItem extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      items: []
    };
    this.processData = this.processData.bind(this);
    this.loadData = this.loadData.bind(this);
    this.reloadTrigger = this.reloadTrigger.bind(this);
  }

  reloadTrigger() {
    this.setState({
      isLoaded: false
    });
  }

  processData(data) {
    if (((data.status / 100) | 0) === 2) {
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
    GCommon.Api.fetchApiResource(Common.typeProperties[this.props.type].name, { callbackOnSuccessLoad: this.processData })
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
              <ItemRaw key={item.id} resource={item.id} type={this.props.type} name={item.name} status={item.status} ready={item.ready} reloadTrigger={this.reloadTrigger} />
            )
          })
        }
      <NewResource resource={this.props.type} />
      </div>
      </>
    )
  }
}
