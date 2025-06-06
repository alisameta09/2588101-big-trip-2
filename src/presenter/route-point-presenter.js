import EditFormView from '../view/edit-form-view.js';
import RoutePointView from '../view/route-point-view.js';
import {render, replace, remove} from '../framework/render.js';
import {UserAction, UpdateType, Mode} from '../const.js';

export default class RoutePointPresenter {
  #container = null;
  #routePointElement = null;
  #editFormElement = null;
  #point = null;
  #offers = null;
  #destinations = null;
  #handleDataChange = null;
  #handleModeChange = null;
  #mode = Mode.DEFAULT;

  constructor({container, onDataChange, onModeChange}) {
    this.#container = container;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point, offers, destinations) {
    this.#point = point;
    this.#offers = offers;
    this.#destinations = destinations;

    const prevRoutePointElement = this.#routePointElement;
    const prevEditFormElement = this.#editFormElement;

    this.#routePointElement = new RoutePointView({
      point: this.#point,
      offers: this.#offers,
      destinations: this.#destinations,
      onUnrollBtnClick: this.#unrollBtnClick,
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#editFormElement = new EditFormView({
      newEvent: false,
      point: this.#point,
      offers: this.#offers,
      destinations: this.#destinations,
      onRollupBtnClick: this.#rollupBtnClick,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick
    });

    if (prevRoutePointElement === null || prevEditFormElement === null) {
      render(this.#routePointElement, this.#container);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#routePointElement, prevRoutePointElement);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#routePointElement, prevEditFormElement);
      this.#mode = Mode.DEFAULT;
    }

    remove(prevRoutePointElement);
    remove(prevEditFormElement);
  }

  destroy() {
    remove(this.#routePointElement);
    remove(this.#editFormElement);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#editFormElement.reset(this.#point);
      this.#replaceEditFormToRoutePoint();
    }
  }

  setSaving() {
    if (this.#mode === Mode.EDITING) {
      this.#editFormElement.updateElement({
        isDisabled: false,
        isSaving: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.EDITING) {
      this.#editFormElement.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  setAborting() {
    if (this.#mode === Mode.DEFAULT) {
      this.#routePointElement.shake();
      return;
    }

    const resetFormState = () => {
      this.#editFormElement.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#editFormElement.shake(resetFormState);
  }

  #replaceRoutePointToEditForm() {
    replace(this.#editFormElement, this.#routePointElement);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #replaceEditFormToRoutePoint() {
    replace(this.#routePointElement, this.#editFormElement);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#editFormElement.reset(this.#point);
      this.#replaceEditFormToRoutePoint();
    }
  };

  #unrollBtnClick = () => {
    this.#replaceRoutePointToEditForm();
  };

  #rollupBtnClick = () => {
    this.#editFormElement.reset(this.#point);
    this.#replaceEditFormToRoutePoint();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      {...this.#point, isFavorite: !this.#point.isFavorite},
    );
  };

  #handleFormSubmit = (point) => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      point,
    );
  };

  #handleDeleteClick = (point) => {
    this.#handleDataChange(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      point,
    );
  };
}
