import EmberObject, { get, computed } from '@ember/object';
import { alias } from '@ember/object/computed'
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';

export const PRESETS = {
  'index.docker.io': 'dockerhub',
  'quay.io': 'quay',
}

export const PRESETS_BY_NAME = {};
Object.keys(PRESETS).forEach(function(key) {
  PRESETS_BY_NAME[ PRESETS[key] ] = key;
});

var DockerCredential = Resource.extend({
  intl: service(),
  router: service(),

  state: 'active',

  actions: {
    edit() {
      get(this, 'router').transitionTo('authenticated.project.registries.detail.edit', get(this, 'id'));
    },
  },

  asArray: computed('registries', function() {
    const all = get(this, 'registries') || {};

    let reg, address, preset;
    return Object.keys(all).map((key) => {
      address = key.toLowerCase();
      reg = all[key];
      preset = PRESETS[address] || 'custom';

      return new EmberObject({
        address,
        auth: reg.auth,
        username: reg.username,
        password: reg.password,
        preset
      });
    });
  }),

  firstRegistry: alias('asArray.firstObject'),
  registryCount: alias('asArray.length'),

  searchAddresses: computed('asArray.[].address', function() {
    return get(this, 'asArray').map(x => get(x, 'address')).sort().uniq();
  }),

  searchUsernames: computed('asArray.[].username', function() {
    return get(this, 'asArray').map(x => get(x, 'username')).sort().uniq();
  }),

  displayAddress: computed('registryCount', 'firstRegistry.address', function() {
    const intl = get(this, 'intl');
    const address = get(this, 'firstRegistry.address');

    if ( get(this, 'registryCount') > 1 ) {
      return intl.t('cruRegistry.multiple');
    } else if ( PRESETS[address] ) {
      return intl.t('cruRegistry.address.' + PRESETS[address]);
    } else {
      return address;
    }
  }),

  displayUsername: computed('registryCount', 'firstRegistry.username', function() {
    const intl = get(this, 'intl');
    const username = get(this, 'firstRegistry.username');

    if ( get(this, 'registryCount') > 1 ) {
      return intl.t('cruRegistry.multiple');
    } else {
      return username;
    }
  }),
});

export default DockerCredential;