const mockDesignProducts = () => {

  const mock = {
    "products": [
      {
        "image_id": "25d3d34f-e7b1-4bee-b8d5-a58ec76c70c8",
        "image_name": "Sunglasses",
        "image_url": "https://cxaimldevuse.blob.core.windows.net/stylingassistant-data/styling-buddy-ui/25d3d34f-e7b1-4bee-b8d5-a58ec76c70c8.png?se=2023-06-29T19%3A56%3A38Z&sp=r&sv=2021-08-06&sr=b&sig=VDFJyHtRcPPvfJLqPSUyNav6VCYNEjxh97n1SeqUpsw%3D"
      },
      {
        "image_id": "7d257d88-d8c8-4bd8-9a96-4175522340da",
        "image_name": "Running Shoes",
        "image_url": "https://cxaimldevuse.blob.core.windows.net/stylingassistant-data/styling-buddy-ui/7d257d88-d8c8-4bd8-9a96-4175522340da.png?se=2023-06-29T19%3A58%3A07Z&sp=r&sv=2021-08-06&sr=b&sig=o2gowUDkwjmr3o8UW25duzdRCH/vsvSqMvP8i33gIUU%3D"
      },
      {
        "image_id": "0e7459f9-8bc9-48cd-9d04-5c74ccac29ea",
        "image_name": "Fashion Bag",
        "image_url": "https://cxaimldevuse.blob.core.windows.net/stylingassistant-data/styling-buddy-ui/0e7459f9-8bc9-48cd-9d04-5c74ccac29ea.png?se=2023-06-29T19%3A45%3A52Z&sp=r&sv=2021-08-06&sr=b&sig=GDEcD2tGk/jASgRcXr5uiMCKS2BAJtEniGigCv2psbI%3D"
      },
      {
        "image_id": "b1215896-c091-4965-8654-e744597a3690",
        "image_name": "Sandles",
        "image_url": "https://cxaimldevuse.blob.core.windows.net/stylingassistant-data/styling-buddy-ui/b1215896-c091-4965-8654-e744597a3690.png?se=2023-06-29T19%3A59%3A28Z&sp=r&sv=2021-08-06&sr=b&sig=cuDNUJTD9/8RNlLkxhTBjFj58cH%2Bk7aodyMRKEBU9H0%3D"
      },
      {
        "image_id": "c2746a7a-9efd-4618-ae11-14f55819eaa2",
        "image_name": "Boots",
        "image_url": "https://cxaimldevuse.blob.core.windows.net/stylingassistant-data/styling-buddy-ui/c2746a7a-9efd-4618-ae11-14f55819eaa2.png?se=2023-06-29T20%3A00%3A51Z&sp=r&sv=2021-08-06&sr=b&sig=2ZUMJzfjknNp568VmpM5mxcIYublSr0PJnl4QDHNCG0%3D"
      },
      {
        "image_id": "012b40cf-4fbb-439e-8ba5-52d462ecb5e6",
        "image_name": "Green Shoes",
        "image_url": "https://cxaimldevuse.blob.core.windows.net/stylingassistant-data/styling-buddy-ui/012b40cf-4fbb-439e-8ba5-52d462ecb5e6.png?se=2023-06-29T20%3A03%3A57Z&sp=r&sv=2021-08-06&sr=b&sig=JBgl159JA/VeJpvaxtEkFkyFubeIkWs3ntWPrtng0i4%3D"
      }
    ]
  };

  return mock;
}

const mockLibraryProducts = () => {

  const mock = {
    "products": [
      {
        "image_id": "c7c5134a-eaee-4910-b7b4-5f898b18fa6e",
        "image_name": "Floral dress",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "female",
        "category": "dress"
      },
      {
        "image_id": "c5b3e1a5-c125-45bc-87d5-90ab5eedb9be",
        "image_name": "Snow pants",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "female",
        "category": "pants"
      },
      {
        "image_id": "5763eea9-f4e5-464e-8ed4-a8bd37ac1a98",
        "image_name": "Polo tshirt",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "male",
        "category": "top"
      },
      {
        "image_id": "f748156c-bc60-46d2-80ba-08bf66ea7d17",
        "image_name": "Leather bag",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "female",
        "category": "bag"
      },
      {
        "image_id": "06798f34-7d11-4a28-a028-ac0548bb60bc",
        "image_name": "Running sneakers",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "female",
        "category": "shoes"
      },
      {
        "image_id": "0748af8a-f637-4399-bd56-50b962ead239",
        "image_name": "shorts",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "male",
        "category": "shorts"
      },
      {
        "image_id": "0411eb78-0cad-46bc-b70b-1d9499fdd356",
        "image_name": "jacket",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "male",
        "category": "outerwear"
      },
      {
        "image_id": "b78b1215-8125-425a-91e8-6e1c30f8b93f",
        "image_name": "Socks",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "male",
        "category": "socks"
      },
      {
        "image_id": "27230aa6-3bae-4a77-92b3-49188a3056b4",
        "image_name": "Jeans",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "male",
        "category": "pants"
      },
      {
        "image_id": "7bb66a6d-0c67-487a-82d8-d619650558ab",
        "image_name": "Graphic tee",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "male",
        "category": "top"
      },
      {
        "image_id": "5f41207f-4304-4587-acb6-dab5e6721788",
        "image_name": "Sunglasses",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "female",
        "category": "sunglasses"
      },
      {
        "image_id": "ec28b709-f770-42b1-8441-fb2c13fd49e7",
        "image_name": "Maxi dress",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "female",
        "category": "dress"
      },
      {
        "image_id": "40222caf-f43a-481c-80c3-4db3531ffd62",
        "image_name": "Black dial mesh watch",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "female",
        "category": "watch"
      },
      {
        "image_id": "e083cc6d-beab-41c3-ab48-d1dedc95b6c9",
        "image_name": "Hat",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "male",
        "category": "hat"
      },
      {
        "image_id": "59cccdc0-a078-4e5f-83d5-56c708a110a4",
        "image_name": "Fancy top",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "female",
        "category": "top"
      },
      {
        "image_id": "43b8d9b2-a209-4d13-9dc3-8af994f382bf",
        "image_name": "Big plaid shirt",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "male",
        "category": "top"
      },
      {
        "image_id": "88aef868-b9cc-4cb6-b71e-d6b51c33bd05",
        "image_name": "Flat sandals",
        "image_url": "assets/images/psearch/{image_id}",
        "gender": "female",
        "category": "shoes"
      },
    ]
  };

  return mock;
}

export { mockDesignProducts, mockLibraryProducts }
