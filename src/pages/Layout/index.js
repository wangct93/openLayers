import React, {PureComponent} from 'react';
import util, {reactUtil} from 'wangct-util';
import {Table, Pagination} from 'antd';
import css from './index.less';
import CMap from "./openlayers";

export default class Layout extends PureComponent {
  state = {};

  componentDidMount() {
    this.createMap();
  }

  createMap(){
    const elem = this.getMapElem();
    const map = new CMap(elem);
  }

  setMapElem = (elem) => {
    this.mapElem = elem;
  };

  getMapElem(){
    return this.mapElem;
  }

  render() {
    const {state} = this;
    return <div className={css.container}>
      <div ref={this.setMapElem} className={css.map_box} />
    </div>
  }
}
