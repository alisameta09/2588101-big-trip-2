import AbstractView from '../framework/view/abstract-view.js';
import {humanizeDate, getTimeDifference, humanizeTime} from '../utils/point.js';
import he from 'he';

function createRoutePointTemplate(point, offers, destinations) {
  const {basePrice, type, dateFrom, dateTo, isFavorite} = point;

  const pointDateFrom = humanizeDate(dateFrom);
  const timeDifference = getTimeDifference(dateTo, dateFrom);
  const poinTimeFrom = humanizeTime(dateFrom);
  const pointTimeTo = humanizeTime(dateTo);

  const pointDestination = destinations.find((dest) => dest.id === point.destination);
  const typeOffers = offers.find((offer) => offer.type === point.type).offers;
  const pointOffers = typeOffers.filter((typeOffer) => point.offers.includes(typeOffer.id));

  const favoriteClassName = isFavorite ? 'event__favorite-btn--active' : '';

  return (`<li class="trip-events__item">
              <div class="event">
                <time class="event__date" datetime="2019-03-18">${pointDateFrom}</time>
                <div class="event__type">
                  <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
                </div>
                <h3 class="event__title">${type} ${he.encode(pointDestination?.name)}</h3>
                <div class="event__schedule">
                  <p class="event__time">
                    <time class="event__start-time" datetime="2019-03-18T10:30">${poinTimeFrom}</time>
                    &mdash;
                    <time class="event__end-time" datetime="2019-03-18T11:00">${pointTimeTo}</time>
                  </p>
                  <p class="event__duration">${timeDifference}</p>
                </div>
                <p class="event__price">
                  &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
                </p>
                <h4 class="visually-hidden">Offers:</h4>
                <ul class="event__selected-offers">
                ${pointOffers.map((offer) => (
      `<li class="event__offer">
                    <span class="event__offer-title">${offer.title}</span>
                    &plus;&euro;&nbsp;
                    <span class="event__offer-price">${offer.price}</span>
                  </li>`
    )).join('')}
                </ul>
                <button class="event__favorite-btn ${favoriteClassName} " type="button">
                  <span class="visually-hidden">Add to favorite</span>
                  <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
                    <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
                  </svg>
                </button>
                <button class="event__rollup-btn" type="button">
                  <span class="visually-hidden">Open event</span>
                </button>
              </div>
            </li>`);
}

export default class RoutePointView extends AbstractView {
  #point = null;
  #offers = null;
  #destinations = null;
  #unrollBtnClick = null;
  #handleFavoriteClick = null;

  constructor({point, offers, destinations, onUnrollBtnClick, onFavoriteClick}) {
    super();
    this.#point = point;
    this.#offers = offers;
    this.#destinations = destinations;
    this.#unrollBtnClick = onUnrollBtnClick;
    this.#handleFavoriteClick = onFavoriteClick;

    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#unrollBtnHandler);
    this.element.querySelector('.event__favorite-btn').addEventListener('click', this.#favoriteClickHandler);
  }

  get template() {
    return createRoutePointTemplate(this.#point, this.#offers, this.#destinations);
  }

  #unrollBtnHandler = (evt) => {
    evt.preventDefault();
    this.#unrollBtnClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavoriteClick();
  };
}
