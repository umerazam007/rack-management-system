from flask import Flask, render_template, request, jsonify
from RackSystem import Item, Rack

app = Flask(__name__)

rack = None


def serialize_item(item):
    return {
        'name': item.GetName(),
        'category': item.GetCategory(),
        'weight': item.GetWeight(),
        'quantity': item.GetQuantity()
    }


def serialize_shelf(shelf):
    return {
        'id': shelf.GetShelfID(),
        'capacity': shelf.GetCapacity(),
        'numberItems': shelf.GetNumberItems(),
        'isFull': shelf.IsFull(),
        'items': [serialize_item(i) for i in shelf.GetItems()]
    }


def serialize_rack():
    return {
        'name': rack.GetRackName(),
        'numberShelves': rack.GetNumberShelves(),
        'totalUsed': rack.GetTotalUsed(),
        'totalCapacity': rack.GetTotalCapacity(),
        'shelves': [serialize_shelf(s) for s in rack.GetShelves()]
    }


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/setup', methods=['POST'])
def setup():
    global rack
    data = request.json
    rack = Rack(data['name'], int(data['shelves']), int(data['capacity']))
    return jsonify({'success': True, 'rack': serialize_rack()})


@app.route('/api/rack')
def get_rack():
    if rack is None:
        return jsonify({'rack': None})
    return jsonify({'rack': serialize_rack()})


@app.route('/api/item/add', methods=['POST'])
def add_item():
    if rack is None:
        return jsonify({'success': False, 'message': 'No rack created'})
    data = request.json
    item = Item(data['name'], data['category'], float(data['weight']), int(data['quantity']))
    shelf_id = int(data.get('shelfId', 0))
    result = rack.AddItem(item, shelf_id)
    return jsonify({'success': result, 'rack': serialize_rack()})


@app.route('/api/item/remove', methods=['POST'])
def remove_item():
    if rack is None:
        return jsonify({'success': False, 'message': 'No rack created'})
    data = request.json
    shelf_id = int(data.get('shelfId', 0))
    result = rack.RemoveItem(data['name'], shelf_id)
    return jsonify({'success': result, 'rack': serialize_rack()})


@app.route('/api/search')
def search():
    if rack is None:
        return jsonify({'results': []})
    query = request.args.get('q', '')
    results = rack.SearchInventory(query)
    return jsonify({'results': [{'shelfId': r[0], 'item': serialize_item(r[1])} for r in results]})


if __name__ == '__main__':
    app.run(debug=True)
