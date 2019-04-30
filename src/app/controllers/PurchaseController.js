const Ad = require('../models/Ad')
const User = require('../models/User')
const Purchase = require('../models/Purchase')
const PurchaseMail = require('../jobs/PurchaseMail')
const Queue = require('../services/Queue')

class PurchaseController {
  async store (req, res) {
    const { ad, content, buyer } = req.body

    const purchaseAd = await Ad.findById(ad).populate('author')
    const user = await User.findById(req.userId)

    Queue.create(PurchaseMail.key, {
      ad: purchaseAd,
      user,
      content
    }).save()

    const purchase = await Purchase.create({ ad, buyer, content })
    return res.json(purchase)
  }

  async update (req, res) {
    const { ad, buyer } = await Purchase.findById(req.params.id)
    const { author, purchasedBy: sold } = await Ad.findById(ad)

    if (!author.equals(req.userId)) {
      return res.status(401).json({ error: 'You are not allowed to do this' })
    }

    if (sold) {
      return res
        .status(400)
        .json({ error: 'The item has already been marked as sold' })
    }

    if (buyer.equals(author)) {
      return res.status(401).json({ error: 'You can not buy your own ad' })
    }

    const adAccept = await Ad.findByIdAndUpdate(
      ad,
      {
        purchasedBy: req.params.id
      },
      {
        new: true
      }
    )

    return res.json(adAccept)
  }
}

module.exports = new PurchaseController()
