import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import 'moment/locale/ja';

import App from 'App';

moment.locale('ja');

ReactDOM.render(<App />, document.getElementById('root'));
